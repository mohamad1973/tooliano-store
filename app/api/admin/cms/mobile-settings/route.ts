import { prisma } from "@/lib/db/prisma";
import { requireApiAdmin, isSessionResponse } from "@/lib/auth/api-session";
import { cmsMutationResponse, parseBody } from "@/lib/cms/admin-api";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";

const MOBILE_KEYS = [
  "mobileNavMode",
  "mobileDrawerSide",
  "mobileShowMarquee",
  "mobileShowTagline",
  "mobileSocialShowFooter",
  "mobileSocialShowHeader",
  "mobileFooterCompact",
  "mobileFooterShowColumns",
] as const;

export async function GET() {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: [...MOBILE_KEYS] } },
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return Response.json({
    mobileNavMode: map.mobileNavMode ?? DEFAULT_SITE_SETTINGS.mobileNavMode,
    mobileDrawerSide:
      map.mobileDrawerSide ?? DEFAULT_SITE_SETTINGS.mobileDrawerSide,
    mobileShowMarquee:
      map.mobileShowMarquee ?? DEFAULT_SITE_SETTINGS.mobileShowMarquee,
    mobileShowTagline:
      map.mobileShowTagline ?? DEFAULT_SITE_SETTINGS.mobileShowTagline,
    mobileSocialShowFooter:
      map.mobileSocialShowFooter ??
      DEFAULT_SITE_SETTINGS.mobileSocialShowFooter,
    mobileSocialShowHeader:
      map.mobileSocialShowHeader ??
      DEFAULT_SITE_SETTINGS.mobileSocialShowHeader,
    mobileFooterCompact:
      map.mobileFooterCompact ?? DEFAULT_SITE_SETTINGS.mobileFooterCompact,
    mobileFooterShowColumns:
      map.mobileFooterShowColumns ??
      DEFAULT_SITE_SETTINGS.mobileFooterShowColumns,
  });
}

export async function PATCH(request: Request) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const body = await parseBody<{
    mobileNavMode?: "burger" | "scroll";
    mobileDrawerSide?: "start" | "end";
    mobileShowMarquee?: boolean;
    mobileShowTagline?: boolean;
    mobileSocialShowFooter?: boolean;
    mobileSocialShowHeader?: boolean;
    mobileFooterCompact?: boolean;
    mobileFooterShowColumns?: boolean;
  }>(request);
  if (body instanceof Response) return body;

  const updates: Record<string, string> = {};

  if (body.mobileNavMode === "burger" || body.mobileNavMode === "scroll") {
    updates.mobileNavMode = body.mobileNavMode;
  }
  if (body.mobileDrawerSide === "start" || body.mobileDrawerSide === "end") {
    updates.mobileDrawerSide = body.mobileDrawerSide;
  }
  if (typeof body.mobileShowMarquee === "boolean") {
    updates.mobileShowMarquee = String(body.mobileShowMarquee);
  }
  if (typeof body.mobileShowTagline === "boolean") {
    updates.mobileShowTagline = String(body.mobileShowTagline);
  }
  if (typeof body.mobileSocialShowFooter === "boolean") {
    updates.mobileSocialShowFooter = String(body.mobileSocialShowFooter);
  }
  if (typeof body.mobileSocialShowHeader === "boolean") {
    updates.mobileSocialShowHeader = String(body.mobileSocialShowHeader);
  }
  if (typeof body.mobileFooterCompact === "boolean") {
    updates.mobileFooterCompact = String(body.mobileFooterCompact);
  }
  if (typeof body.mobileFooterShowColumns === "boolean") {
    updates.mobileFooterShowColumns = String(body.mobileFooterShowColumns);
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
