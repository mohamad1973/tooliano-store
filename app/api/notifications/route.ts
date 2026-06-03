import { NextResponse } from "next/server";
import {
  isSessionResponse,
  requireApiSession,
} from "@/lib/auth/api-session";
import { prisma } from "@/lib/db/prisma";
import { fetchUserNotifications } from "@/lib/notifications/fetch-user-notifications";

export async function GET() {
  const session = await requireApiSession();
  if (isSessionResponse(session)) return session;

  const { items, unreadCount } = await fetchUserNotifications(session.userId);
  return NextResponse.json({
    items: items.map((n) => ({
      id: n.id,
      type: n.type,
      productName: n.productName,
      message: n.message,
      orderId: n.orderId,
      submissionId: n.submissionId,
      remainingQuantity: n.remainingQuantity,
      readAt: n.readAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
  });
}

export async function PATCH(request: Request) {
  const session = await requireApiSession();
  if (isSessionResponse(session)) return session;

  const body = await request.json().catch(() => ({}));
  const now = new Date();

  if (body.all === true) {
    await prisma.appNotification.updateMany({
      where: { userId: session.userId, readAt: null },
      data: { readAt: now },
    });
  } else if (Array.isArray(body.ids) && body.ids.length > 0) {
    await prisma.appNotification.updateMany({
      where: {
        userId: session.userId,
        id: { in: body.ids as string[] },
      },
      data: { readAt: now },
    });
  } else {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const unreadCount = await prisma.appNotification.count({
    where: { userId: session.userId, readAt: null },
  });

  return NextResponse.json({ ok: true, unreadCount });
}
