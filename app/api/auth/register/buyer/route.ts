import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { USER_ROLES } from "@/lib/db/constants";
import { generateUniqueReferralCode } from "@/lib/affiliate/referral-code";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim() || null;

    if (username.length < 3) {
      return NextResponse.json(
        { error: "اسم المستخدم 3 أحرف على الأقل" },
        { status: 400 },
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور 6 أحرف على الأقل" },
        { status: 400 },
      );
    }
    if (!phone) {
      return NextResponse.json(
        { error: "رقم الموبايل مطلوب" },
        { status: 400 },
      );
    }

    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) {
      return NextResponse.json(
        { error: "اسم المستخدم مستخدم بالفعل" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const referralCode = await generateUniqueReferralCode();
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        role: USER_ROLES.BUYER,
        phone,
        email,
        referralCode,
      },
    });

    await createSession({
      userId: user.id,
      username: user.username,
      role: USER_ROLES.BUYER,
    });

    return NextResponse.json({ ok: true, redirectTo: "/" });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        error: "خطأ في الخادم",
        detail:
          process.env.NODE_ENV === "development" && e instanceof Error
            ? e.message
            : undefined,
      },
      { status: 500 },
    );
  }
}
