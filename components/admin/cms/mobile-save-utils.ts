export type MobileSaveStatus = {
  type: "success" | "error" | "saving";
  text: string;
};

export type MobileSaveStatusHandler = (status: MobileSaveStatus | null) => void;

/** PATCH إعدادات الموبايل — body بمفاتيح MobileDisplaySettings */
export async function patchMobileSettings(
  patch: Record<string, unknown>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch("/api/admin/cms/mobile-settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: data.error ?? "فشل الحفظ" };
  }
  return { ok: true };
}
