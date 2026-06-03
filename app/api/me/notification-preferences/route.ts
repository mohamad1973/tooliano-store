import { NextResponse } from "next/server";
import {
  isSessionResponse,
  requireApiSession,
} from "@/lib/auth/api-session";
import { ensureNotificationPreference } from "@/lib/notifications/preferences";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await requireApiSession();
  if (isSessionResponse(session)) return session;

  const pref = await ensureNotificationPreference(session.userId);
  return NextResponse.json({
    enabled: pref.enabled,
    silent: pref.silent,
  });
}

export async function PATCH(request: Request) {
  const session = await requireApiSession();
  if (isSessionResponse(session)) return session;

  const body = await request.json().catch(() => ({}));
  const data: { enabled?: boolean; silent?: boolean } = {};
  if (typeof body.enabled === "boolean") data.enabled = body.enabled;
  if (typeof body.silent === "boolean") data.silent = body.silent;

  const pref = await prisma.userNotificationPreference.upsert({
    where: { userId: session.userId },
    create: {
      userId: session.userId,
      enabled: data.enabled ?? true,
      silent: data.silent ?? true,
    },
    update: data,
  });

  return NextResponse.json({
    enabled: pref.enabled,
    silent: pref.silent,
  });
}
