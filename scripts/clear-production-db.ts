import { PrismaClient } from "@prisma/client";
import { loadEnvLocal } from "./lib/load-env-local";

loadEnvLocal();
const prisma = new PrismaClient();

async function main() {
  await prisma.productSubmission.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ تم تفريغ الجداول");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
