import { NextResponse } from "next/server";
import {
  isSessionResponse,
  requireApiBuyer,
} from "@/lib/auth/api-session";
import { prisma } from "@/lib/db/prisma";
import {
  canSimulatePayment,
  createPaymobPaymentUrl,
  paymobConfigured,
} from "@/lib/payments/paymob";
import { getOrderBalances } from "@/lib/orders/order-balances";
import { roundMoney } from "@/lib/orders/pricing";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await requireApiBuyer();
    if (isSessionResponse(session)) return session;

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const simulate = Boolean(body.simulate);

    const order = await prisma.groupBuyOrder.findUnique({
      where: { id },
      include: { buyer: true },
    });

    if (!order || order.buyerId !== session.userId) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    const balances = getOrderBalances(order);
    if (balances.fullyPaidOnline) {
      return NextResponse.json({ error: "الطلب مدفوع بالكامل" }, { status: 400 });
    }

    let amount =
      body.amount != null ? Number(body.amount) : balances.remainingBalance;
    if (order.paidOnlineTotal <= 0.01 && !body.amount) {
      amount = balances.minDepositAmount;
    }
    amount = roundMoney(amount);

    if (simulate) {
      if (!canSimulatePayment()) {
        return NextResponse.json(
          { error: "محاكاة الدفع غير متاحة في الإنتاج" },
          { status: 403 },
        );
      }
      const { confirmOrderPayment } = await import("@/lib/orders/confirm-payment");
      await confirmOrderPayment({
        orderId: order.id,
        amount,
        paymentRef: `dev-sim-${order.id}-${Date.now()}`,
        idempotencyKey: `dev-sim:${order.id}:${Date.now()}`,
      });
      return NextResponse.json({
        ok: true,
        simulated: true,
        amount,
        redirectTo: `/account/orders/${order.id}`,
      });
    }

    if (!paymobConfigured()) {
      return NextResponse.json(
        {
          error:
            "بوابة الدفع غير مُعدّة. استخدم محاكاة الدفع في التطوير أو أضف مفاتيح Paymob.",
          canSimulate: canSimulatePayment(),
        },
        { status: 503 },
      );
    }

    const amountCents = Math.round(amount * 100);
    const { paymentUrl, paymobOrderId } = await createPaymobPaymentUrl({
      amountCents,
      orderId: `${order.id}:${amountCents}`,
      buyerEmail: order.buyer.email ?? undefined,
      buyerPhone: order.buyer.phone ?? undefined,
      buyerName: order.buyer.username,
    });

    await prisma.groupBuyOrder.update({
      where: { id: order.id },
      data: { paymobOrderId },
    });

    return NextResponse.json({
      ok: true,
      paymentUrl,
      paymobOrderId,
      amount,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "خطأ في إنشاء الدفع";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
