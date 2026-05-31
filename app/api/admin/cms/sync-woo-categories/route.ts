import { requireApiAdmin, isSessionResponse } from "@/lib/auth/api-session";
import { cmsMutationResponse } from "@/lib/cms/admin-api";
import { repairNavMenuLinksInDb } from "@/lib/cms/repair-nav-menu";
import { syncWooCategoriesToCms } from "@/lib/cms/sync-woo-categories";

/** إصلاح روابط المنيو القديمة فقط (بدون إعادة بناء القائمة من Woo). */
export async function PATCH() {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  try {
    const { repaired } = await repairNavMenuLinksInDb();
    return cmsMutationResponse({ ok: true, menuRepaired: repaired });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "تعذّر إصلاح روابط المنيو";
    return Response.json({ error: message }, { status: 502 });
  }
}

export async function POST() {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  try {
    const result = await syncWooCategoriesToCms();
    return cmsMutationResponse({ ok: true, ...result });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "تعذّر الاتصال بـ WooCommerce";
    return Response.json({ error: message }, { status: 502 });
  }
}
