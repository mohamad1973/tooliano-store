import { prisma } from "@/lib/db/prisma";
import { requireApiAdmin, isSessionResponse } from "@/lib/auth/api-session";
import { cmsMutationResponse, parseBody } from "@/lib/cms/admin-api";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import {
  parseMobileSettingsPatch,
  type MobileSettingsApiBody,
} from "@/lib/cms/mobile-settings-api";
import type { MobileDisplaySettings } from "@/lib/cms/types";

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

  const body = await parseBody<
    Partial<MobileDisplaySettings> & MobileSettingsApiBody
  >(request);
  if (body instanceof Response) return body;

  const updates = parseMobileSettingsPatch(body);

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "لا توجد حقول صالحة" }, { status: 400 });
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
