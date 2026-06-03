import "server-only";

import { prisma } from "@/lib/db/prisma";

export async function ensureNotificationPreference(userId: string) {
  const existing = await prisma.userNotificationPreference.findUnique({
    where: { userId },
  });
  if (existing) return existing;
  return prisma.userNotificationPreference.create({
    data: { userId, enabled: true, silent: true },
  });
}

export async function isNotificationEnabled(userId: string): Promise<boolean> {
  const pref = await prisma.userNotificationPreference.findUnique({
    where: { userId },
  });
  if (!pref) return true;
  return pref.enabled;
}
