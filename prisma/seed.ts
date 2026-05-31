import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";

  const existing = await prisma.user.findUnique({ where: { username } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        username,
        passwordHash,
        role: "ADMIN",
        email: "admin@tooliano.com",
      },
    });
    console.log("Admin created:", username);
  } else {
    console.log("Admin user already exists:", username);
  }

  const migrated = await prisma.productSubmission.updateMany({
    where: {
      status: "APPROVED",
      publishedOnStore: false,
    },
    data: { publishedOnStore: true },
  });
  if (migrated.count > 0) {
    console.log("Migrated approved products to publishedOnStore:", migrated.count);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
