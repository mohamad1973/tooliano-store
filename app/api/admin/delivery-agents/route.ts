import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  isSessionResponse,
  requireApiAdmin,
} from "@/lib/auth/api-session";
import { prisma } from "@/lib/db/prisma";
import { USER_ROLES } from "@/lib/db/constants";

export async function GET() {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const agents = await prisma.user.findMany({
    where: { role: USER_ROLES.DELIVERY_AGENT },
    select: { id: true, username: true, phone: true, email: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ agents });
}

export async function POST(request: Request) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const body = await request.json();
  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");
  const phone = body.phone ? String(body.phone) : null;

  if (!username || password.length < 6) {
    return NextResponse.json(
      { error: "اسم المستخدم وكلمة مرور (6+ أحرف) مطلوبان" },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "اسم المستخدم مستخدم" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
      role: USER_ROLES.DELIVERY_AGENT,
      phone,
    },
    select: { id: true, username: true, phone: true },
  });

  return NextResponse.json({ ok: true, agent: user });
}
