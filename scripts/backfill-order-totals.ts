import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.groupBuyOrder.findMany();
  let n = 0;
  for (const o of orders) {
    const lineTotal = Math.round(o.unitGroupPrice * o.quantity * 100) / 100;
    const minDeposit = Math.round(lineTotal * 0.05 * 100) / 100;
    const paid =
      o.status !== "PENDING_PAYMENT"
        ? o.paidOnlineTotal > 0
          ? o.paidOnlineTotal
          : o.depositAmount
        : 0;
    const cod = Math.max(0, Math.round((lineTotal - paid) * 100) / 100);
    await prisma.groupBuyOrder.update({
      where: { id: o.id },
      data: {
        lineTotal,
        minDepositAmount: minDeposit,
        paidOnlineTotal: paid,
        codAmount: cod,
      },
    });
    n++;
  }
  console.log("Backfilled orders:", n);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
