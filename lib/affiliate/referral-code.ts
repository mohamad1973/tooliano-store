import "server-only";

import { prisma } from "@/lib/db/prisma";
import { USER_ROLES } from "@/lib/db/constants";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomChunk(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return out;
}

export async function generateUniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const code = randomChunk(8);
    const exists = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  throw new Error("تعذّر توليد كود إحالة فريد");
}

export async function ensureBuyerReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true, role: true },
  });
  if (!user || user.role !== USER_ROLES.BUYER) {
    throw new Error("حساب غير صالح للإحالة");
  }
  if (user.referralCode) return user.referralCode;

  const code = await generateUniqueReferralCode();
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code },
    select: { referralCode: true },
  });
  return updated.referralCode!;
}

export async function findReferrerByCode(
  code: string | null | undefined,
): Promise<{ id: string; username: string } | null> {
  const normalized = code?.trim().toUpperCase();
  if (!normalized) return null;

  const user = await prisma.user.findFirst({
    where: {
      referralCode: normalized,
      role: USER_ROLES.BUYER,
      disabled: false,
    },
    select: { id: true, username: true },
  });
  return user;
}
