import { NextResponse } from "next/server";
import {
  isSessionResponse,
  requireApiBuyer,
} from "@/lib/auth/api-session";
import { createGroupBuyOrder } from "@/lib/orders/create-order";

export async function POST(request: Request) {
  try {
    const session = await requireApiBuyer();
    if (isSessionResponse(session)) return session;

    const body = await request.json();
    const submissionId = String(body.submissionId ?? "");
    const quantity = Number(body.quantity ?? 1);

    if (!submissionId) {
      return NextResponse.json({ error: "معرّف الحملة مطلوب" }, { status: 400 });
    }

    const order = await createGroupBuyOrder({
      buyerId: session.userId,
      submissionId,
      quantity,
    });

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      depositAmount: order.depositAmount,
      codAmount: order.codAmount,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "خطأ في الخادم";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
