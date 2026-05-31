import "server-only";

import { createHmac } from "crypto";

const ACCEPT_BASE = "https://accept.paymob.com/api";

function paymobConfigured(): boolean {
  return Boolean(
    process.env.PAYMOB_API_KEY &&
      process.env.PAYMOB_INTEGRATION_ID &&
      process.env.PAYMOB_HMAC_SECRET,
  );
}

export function isPaymobLive(): boolean {
  return paymobConfigured() && process.env.NODE_ENV === "production";
}

export function canSimulatePayment(): boolean {
  if (process.env.PAYMOB_ALLOW_DEV_SIMULATE === "true") return true;
  return process.env.NODE_ENV !== "production";
}

async function getAuthToken(): Promise<string> {
  const apiKey = process.env.PAYMOB_API_KEY;
  if (!apiKey) throw new Error("PAYMOB_API_KEY missing");

  const res = await fetch(`${ACCEPT_BASE}/auth/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey }),
  });
  const data = (await res.json()) as { token?: string };
  if (!data.token) throw new Error("Paymob auth failed");
  return data.token;
}

export async function createPaymobPaymentUrl(input: {
  amountCents: number;
  orderId: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerName: string;
}): Promise<{ paymentUrl: string; paymobOrderId: string }> {
  const token = await getAuthToken();
  const integrationId = Number(process.env.PAYMOB_INTEGRATION_ID);
  const iframeId = process.env.PAYMOB_IFRAME_ID;

  const orderRes = await fetch(`${ACCEPT_BASE}/ecommerce/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: token,
      delivery_needed: false,
      amount_cents: input.amountCents,
      currency: "EGP",
      merchant_order_id: input.orderId,
      items: [],
    }),
  });
  const orderData = (await orderRes.json()) as { id?: number };
  if (!orderData.id) throw new Error("Paymob order creation failed");

  const billingData = {
    apartment: "NA",
    email: input.buyerEmail ?? "buyer@tooliano.com",
    floor: "NA",
    first_name: input.buyerName,
    street: "NA",
    building: "NA",
    phone_number: input.buyerPhone ?? "01000000000",
    shipping_method: "NA",
    postal_code: "NA",
    city: "Cairo",
    country: "EG",
    last_name: "Buyer",
    state: "NA",
  };

  const keyRes = await fetch(`${ACCEPT_BASE}/acceptance/payment_keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: token,
      amount_cents: input.amountCents,
      expiration: 3600,
      order_id: orderData.id,
      billing_data: billingData,
      currency: "EGP",
      integration_id: integrationId,
    }),
  });
  const keyData = (await keyRes.json()) as { token?: string };
  if (!keyData.token) throw new Error("Paymob payment key failed");

  const paymentUrl = iframeId
    ? `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${keyData.token}`
    : `https://accept.paymob.com/api/acceptance/payments/pay?token=${keyData.token}`;

  return {
    paymentUrl,
    paymobOrderId: String(orderData.id),
  };
}

/** تحقق HMAC لـ Paymob transaction callback */
export function verifyPaymobHmac(
  obj: Record<string, string | number | boolean | null | undefined>,
  receivedHmac: string,
): boolean {
  const secret = process.env.PAYMOB_HMAC_SECRET;
  if (!secret) return false;

  const keys = [
    "amount_cents",
    "created_at",
    "currency",
    "error_occured",
    "has_parent_transaction",
    "id",
    "integration_id",
    "is_3d_secure",
    "is_auth",
    "is_capture",
    "is_refunded",
    "is_standalone_payment",
    "is_voided",
    "order",
    "owner",
    "pending",
    "source_data_pan",
    "source_data_sub_type",
    "source_data_type",
    "success",
  ] as const;

  const concatenated = keys
    .map((k) => {
      const v = obj[k];
      if (v === undefined || v === null) return "";
      if (typeof v === "object") return JSON.stringify(v);
      return String(v);
    })
    .join("");

  const calculated = createHmac("sha512", secret)
    .update(concatenated)
    .digest("hex");

  return calculated === receivedHmac;
}

export { paymobConfigured };
