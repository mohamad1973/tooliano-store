import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  affiliateRefCookieOptions,
  normalizeReferralCode,
} from "@/lib/affiliate/capture-ref";
import { findReferrerByCode } from "@/lib/affiliate/referral-code";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = normalizeReferralCode(String(body.ref ?? ""));
    if (!code) {
      return NextResponse.json({ error: "كود غير صالح" }, { status: 400 });
    }

    const referrer = await findReferrerByCode(code);
    if (!referrer) {
      return NextResponse.json({ error: "كود غير موجود" }, { status: 404 });
    }

    const opts = affiliateRefCookieOptions();
    const cookieStore = await cookies();
    cookieStore.set(opts.name, code, {
      maxAge: opts.maxAge,
      path: opts.path,
      sameSite: opts.sameSite,
      secure: opts.secure,
    });

    return NextResponse.json({ ok: true, code });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
