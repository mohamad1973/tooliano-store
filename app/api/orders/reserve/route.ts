import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  isSessionResponse,
  requireApiBuyer,
} from "@/lib/auth/api-session";
import { AFFILIATE_REF_COOKIE } from "@/lib/affiliate/constants";
import { normalizeReferralCode } from "@/lib/affiliate/capture-ref";
import { resolveReferrerForOrder } from "@/lib/affiliate/resolve-referrer";
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

    const cookieStore = await cookies();
    const cookieRef = cookieStore.get(AFFILIATE_REF_COOKIE)?.value;
    const bodyRef = body.referralCode ? String(body.referralCode) : null;
    const referralCode = normalizeReferralCode(bodyRef ?? cookieRef);

    const referrerUserId = await resolveReferrerForOrder({
      referralCode,
      buyerId: session.userId,
      submissionId,
    });

    const order = await createGroupBuyOrder({
      buyerId: session.userId,
      submissionId,
      quantity,
      referrerUserId,
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
