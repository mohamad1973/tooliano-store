import "server-only";

import { prisma } from "@/lib/db/prisma";

export async function fetchUserNotifications(userId: string, limit = 30) {
  const [items, unreadCount] = await Promise.all([
    prisma.appNotification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.appNotification.count({
      where: { userId, readAt: null },
    }),
  ]);

  return { items, unreadCount };
}
