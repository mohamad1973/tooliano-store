import { PrismaClient } from "@prisma/client";
import { USER_ROLES } from "../lib/db/constants";

const prisma = new PrismaClient();

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomChunk(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return out;
}

async function generateUniqueCode(): Promise<string> {
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

async function main() {
  const buyers = await prisma.user.findMany({
    where: {
      role: USER_ROLES.BUYER,
      referralCode: null,
    },
    select: { id: true, username: true },
  });

  let updated = 0;
  for (const buyer of buyers) {
    const code = await generateUniqueCode();
    await prisma.user.update({
      where: { id: buyer.id },
      data: { referralCode: code },
    });
    updated++;
    console.log(`@${buyer.username} → ${code}`);
  }

  console.log(`Backfilled referral codes: ${updated} / ${buyers.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
