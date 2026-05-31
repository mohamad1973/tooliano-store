import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { USER_ROLES } from "@/lib/db/constants";
import { isWordPressMediaUploadConfigured } from "@/lib/wp-media-config";
import { verifyWordPressMediaAuth } from "@/lib/wp-media-verify";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== USER_ROLES.ADMIN) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const configured = isWordPressMediaUploadConfigured();
  if (!configured) {
    return NextResponse.json({
      configured: false,
      verified: false,
      message:
        "أضف WP_MEDIA_USER و WP_APP_PASSWORD في .env.local — راجع docs/WORDPRESS-MEDIA-SETUP.md",
    });
  }

  const verify = await verifyWordPressMediaAuth();
  return NextResponse.json({
    configured: true,
    verified: verify.ok,
    message: verify.message,
  });
}
