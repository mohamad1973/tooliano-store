import { prisma } from "@/lib/db/prisma";
import { requireApiAdmin, isSessionResponse } from "@/lib/auth/api-session";
import { cmsMutationResponse, parseBody } from "@/lib/cms/admin-api";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";

const SOCIAL_KEYS = [
  "socialShowHeader",
  "socialShowFooter",
  "socialShowSide",
  "socialSidePosition",
  "socialClickMode",
] as const;

export async function GET() {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: [...SOCIAL_KEYS] } },
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return Response.json({
    socialShowHeader: map.socialShowHeader ?? DEFAULT_SITE_SETTINGS.socialShowHeader,
    socialShowFooter: map.socialShowFooter ?? DEFAULT_SITE_SETTINGS.socialShowFooter,
    socialShowSide: map.socialShowSide ?? DEFAULT_SITE_SETTINGS.socialShowSide,
    socialSidePosition:
      map.socialSidePosition ?? DEFAULT_SITE_SETTINGS.socialSidePosition,
    socialClickMode: map.socialClickMode ?? DEFAULT_SITE_SETTINGS.socialClickMode,
  });
}

export async function PATCH(request: Request) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const body = await parseBody<{
    socialShowHeader?: boolean;
    socialShowFooter?: boolean;
    socialShowSide?: boolean;
    socialSidePosition?: "start" | "end";
    socialClickMode?: "chooser" | "direct";
  }>(request);
  if (body instanceof Response) return body;

  const updates: Record<string, string> = {};
  if (typeof body.socialShowHeader === "boolean") {
    updates.socialShowHeader = String(body.socialShowHeader);
  }
  if (typeof body.socialShowFooter === "boolean") {
    updates.socialShowFooter = String(body.socialShowFooter);
  }
  if (typeof body.socialShowSide === "boolean") {
    updates.socialShowSide = String(body.socialShowSide);
  }
  if (body.socialSidePosition === "start" || body.socialSidePosition === "end") {
    updates.socialSidePosition = body.socialSidePosition;
  }
  if (body.socialClickMode === "chooser" || body.socialClickMode === "direct") {
    updates.socialClickMode = body.socialClickMode;
  }

  for (const [key, value] of Object.entries(updates)) {
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  return cmsMutationResponse();
}
