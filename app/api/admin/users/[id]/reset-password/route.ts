import { NextResponse } from "next/server";
import {
  isSessionResponse,
  requireApiAdmin,
} from "@/lib/auth/api-session";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const { id } = await params;
  const body = await request.json();
  const password = String(body.password ?? "");

  if (password.length < 6) {
    return NextResponse.json(
      { error: "كلمة المرور 6 أحرف على الأقل" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { passwordHash } }),
    prisma.adminAuditLog.create({
      data: {
        adminId: session.userId,
        action: "RESET_PASSWORD",
        targetUserId: id,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
