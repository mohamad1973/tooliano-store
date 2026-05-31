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

  const agentUsername = process.env.DELIVERY_AGENT_USERNAME ?? "agent1";
  const agentPassword = process.env.DELIVERY_AGENT_PASSWORD ?? "agent123";
  const agentExisting = await prisma.user.findUnique({
    where: { username: agentUsername },
  });
  if (!agentExisting) {
    const passwordHash = await bcrypt.hash(agentPassword, 12);
    await prisma.user.create({
      data: {
        username: agentUsername,
        passwordHash,
        role: "DELIVERY_AGENT",
        phone: "01000000001",
      },
    });
    console.log("Delivery agent created:", agentUsername);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
