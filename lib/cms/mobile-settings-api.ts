import type { MobileDisplaySettings } from "@/lib/cms/types";

export type MobileSettingsApiBody = {
  mobileNavMode?: "burger" | "scroll";
  mobileDrawerSide?: "start" | "end";
  mobileShowMarquee?: boolean;
  mobileShowTagline?: boolean;
  mobileSocialShowFooter?: boolean;
  mobileSocialShowHeader?: boolean;
  mobileFooterCompact?: boolean;
  mobileFooterShowColumns?: boolean;
};

type PatchInput = Partial<MobileDisplaySettings> & MobileSettingsApiBody;

/** تحويل من شكل MobileDisplaySettings إلى مفاتيح DB للـ PATCH */
export function mobileDisplayToApiBody(
  patch: Partial<MobileDisplaySettings>,
): MobileSettingsApiBody {
  const body: MobileSettingsApiBody = {};
  if (patch.navMode === "burger" || patch.navMode === "scroll") {
    body.mobileNavMode = patch.navMode;
  }
  if (patch.drawerSide === "start" || patch.drawerSide === "end") {
    body.mobileDrawerSide = patch.drawerSide;
  }
  if (typeof patch.showMarquee === "boolean") {
    body.mobileShowMarquee = patch.showMarquee;
  }
  if (typeof patch.showTagline === "boolean") {
    body.mobileShowTagline = patch.showTagline;
  }
  if (typeof patch.socialShowFooter === "boolean") {
    body.mobileSocialShowFooter = patch.socialShowFooter;
  }
  if (typeof patch.socialShowHeader === "boolean") {
    body.mobileSocialShowHeader = patch.socialShowHeader;
  }
  if (typeof patch.footerCompact === "boolean") {
    body.mobileFooterCompact = patch.footerCompact;
  }
  if (typeof patch.footerShowColumns === "boolean") {
    body.mobileFooterShowColumns = patch.footerShowColumns;
  }
  return body;
}

/** قبول كلا الشكلين من طلب PATCH (display keys + mobile* keys) */
export function parseMobileSettingsPatch(body: PatchInput): Record<string, string> {
  const api = {
    ...mobileDisplayToApiBody(body),
    ...(body.mobileNavMode === "burger" || body.mobileNavMode === "scroll"
      ? { mobileNavMode: body.mobileNavMode }
      : {}),
    ...(body.mobileDrawerSide === "start" || body.mobileDrawerSide === "end"
      ? { mobileDrawerSide: body.mobileDrawerSide }
      : {}),
    ...(typeof body.mobileShowMarquee === "boolean"
      ? { mobileShowMarquee: body.mobileShowMarquee }
      : {}),
    ...(typeof body.mobileShowTagline === "boolean"
      ? { mobileShowTagline: body.mobileShowTagline }
      : {}),
    ...(typeof body.mobileSocialShowFooter === "boolean"
      ? { mobileSocialShowFooter: body.mobileSocialShowFooter }
      : {}),
    ...(typeof body.mobileSocialShowHeader === "boolean"
      ? { mobileSocialShowHeader: body.mobileSocialShowHeader }
      : {}),
    ...(typeof body.mobileFooterCompact === "boolean"
      ? { mobileFooterCompact: body.mobileFooterCompact }
      : {}),
    ...(typeof body.mobileFooterShowColumns === "boolean"
      ? { mobileFooterShowColumns: body.mobileFooterShowColumns }
      : {}),
  };

  const updates: Record<string, string> = {};
  if (api.mobileNavMode === "burger" || api.mobileNavMode === "scroll") {
    updates.mobileNavMode = api.mobileNavMode;
  }
  if (api.mobileDrawerSide === "start" || api.mobileDrawerSide === "end") {
    updates.mobileDrawerSide = api.mobileDrawerSide;
  }
  if (typeof api.mobileShowMarquee === "boolean") {
    updates.mobileShowMarquee = String(api.mobileShowMarquee);
  }
  if (typeof api.mobileShowTagline === "boolean") {
    updates.mobileShowTagline = String(api.mobileShowTagline);
  }
  if (typeof api.mobileSocialShowFooter === "boolean") {
    updates.mobileSocialShowFooter = String(api.mobileSocialShowFooter);
  }
  if (typeof api.mobileSocialShowHeader === "boolean") {
    updates.mobileSocialShowHeader = String(api.mobileSocialShowHeader);
  }
  if (typeof api.mobileFooterCompact === "boolean") {
    updates.mobileFooterCompact = String(api.mobileFooterCompact);
  }
  if (typeof api.mobileFooterShowColumns === "boolean") {
    updates.mobileFooterShowColumns = String(api.mobileFooterShowColumns);
  }
  return updates;
}
