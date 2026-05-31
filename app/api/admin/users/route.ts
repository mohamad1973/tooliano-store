import { NextResponse } from "next/server";
import {
  isSessionResponse,
  requireApiAdmin,
} from "@/lib/auth/api-session";
import { prisma } from "@/lib/db/prisma";
import { USER_ROLES, type UserRole } from "@/lib/db/constants";

export async function GET(request: Request) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") as UserRole | null;
  const q = searchParams.get("q")?.trim();

  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role } : {}),
      ...(q
        ? {
            OR: [
              { username: { contains: q } },
              { email: { contains: q } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      username: true,
      role: true,
      phone: true,
      email: true,
      disabled: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const counts = await prisma.user.groupBy({
    by: ["role"],
    _count: { id: true },
  });

  return NextResponse.json({ users, counts });
}
