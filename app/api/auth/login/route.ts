import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { USER_ROLES, type UserRole } from "@/lib/db/constants";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");

    if (!username || !password) {
      return NextResponse.json(
        { error: "اسم المستخدم وكلمة المرور مطلوبان" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "بيانات الدخول غير صحيحة" },
        { status: 401 },
      );
    }

    await createSession({
      userId: user.id,
      username: user.username,
      role: user.role as UserRole,
    });

    const redirectTo =
      user.role === USER_ROLES.ADMIN
        ? "/admin"
        : user.role === USER_ROLES.VENDOR
          ? "/vendor"
          : user.role === USER_ROLES.DELIVERY_AGENT
            ? "/delivery"
            : user.role === USER_ROLES.BUYER
              ? "/account"
              : "/";

    return NextResponse.json({ ok: true, redirectTo });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
