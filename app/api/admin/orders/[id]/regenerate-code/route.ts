import { NextResponse } from "next/server";
import {
  isSessionResponse,
  requireApiAdmin,
} from "@/lib/auth/api-session";
import { issueDeliveryCodeForOrder } from "@/lib/campaign/issue-codes";
import { prisma } from "@/lib/db/prisma";
import { ORDER_STATUS } from "@/lib/db/constants";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const { id } = await params;
  const order = await prisma.groupBuyOrder.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  }
  if (order.status !== ORDER_STATUS.READY_FOR_DELIVERY) {
    return NextResponse.json(
      { error: "الطلب ليس جاهزاً للتسليم" },
      { status: 400 },
    );
  }

  const code = await issueDeliveryCodeForOrder(order.id);
  return NextResponse.json({ ok: true, code });
}
