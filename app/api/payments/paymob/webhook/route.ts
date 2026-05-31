import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { confirmOrderPayment } from "@/lib/orders/confirm-payment";
import { verifyPaymobHmac } from "@/lib/payments/paymob";
import { roundMoney } from "@/lib/orders/pricing";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const obj = (body.obj ?? body) as Record<string, unknown>;
    const hmac =
      request.headers.get("hmac") ?? String(body.hmac ?? "");

    if (!verifyPaymobHmac(obj as Record<string, string>, hmac)) {
      return NextResponse.json({ error: "HMAC invalid" }, { status: 401 });
    }

    const success = obj.success === true || obj.success === "true";
    if (!success) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const merchantRef =
      typeof obj.order === "object" && obj.order !== null
        ? String(
            (obj.order as { merchant_order_id?: string }).merchant_order_id ?? "",
          )
        : "";
    const txnId = String(obj.id ?? "");
    if (!merchantRef || !txnId) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const orderId = merchantRef.split(":")[0] ?? merchantRef;
    const amountCents = Number(obj.amount_cents ?? 0);
    const amount = roundMoney(amountCents / 100);

    const order = await prisma.groupBuyOrder.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      return NextResponse.json({ error: "طلب غير موجود" }, { status: 404 });
    }

    await confirmOrderPayment({
      orderId: order.id,
      amount: amount > 0 ? amount : order.minDepositAmount,
      paymentRef: `paymob:${txnId}`,
      idempotencyKey: `paymob:txn:${txnId}`,
      paymobOrderId: String(
        (obj.order as { id?: number })?.id ?? order.paymobOrderId ?? "",
      ),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("paymob webhook", e);
    return NextResponse.json({ error: "webhook error" }, { status: 500 });
  }
}
