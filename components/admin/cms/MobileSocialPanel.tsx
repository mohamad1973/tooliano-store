"use client";

import { useEffect, useState } from "react";
import { AdminCmsMessage } from "@/components/admin/cms/AdminCmsMessage";
import { SocialLinksListEditor } from "@/components/admin/cms/SocialLinksListEditor";
import {
  patchMobileSettings,
  type MobileSaveStatusHandler,
} from "@/components/admin/cms/mobile-save-utils";
import type { SocialLinkView } from "@/lib/cms/types";

type Props = {
  initialLinks: SocialLinkView[];
  initialMobileSocialShowHeader: boolean;
  initialMobileSocialShowFooter: boolean;
  initialClickMode: "chooser" | "direct";
  onSaveStatus?: MobileSaveStatusHandler;
};

export function MobileSocialPanel({
  initialLinks,
  initialMobileSocialShowHeader,
  initialMobileSocialShowFooter,
  initialClickMode,
  onSaveStatus,
}: Props) {
  const [showHeader, setShowHeader] = useState(initialMobileSocialShowHeader);
  const [showFooter, setShowFooter] = useState(initialMobileSocialShowFooter);
  const [clickMode, setClickMode] = useState(initialClickMode);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setShowHeader(initialMobileSocialShowHeader);
    setShowFooter(initialMobileSocialShowFooter);
    setClickMode(initialClickMode);
  }, [
    initialMobileSocialShowHeader,
    initialMobileSocialShowFooter,
    initialClickMode,
  ]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(t);
  }, [message]);

  async function saveMobilePlacement(
    patch: Partial<{ socialShowHeader: boolean; socialShowFooter: boolean }>,
  ) {
    setError(null);
    setMessage(null);
    setSaving(true);
    onSaveStatus?.({ type: "saving", text: "جاري الحفظ…" });

    const body: Record<string, boolean> = {};
    if (patch.socialShowHeader !== undefined) {
      body.mobileSocialShowHeader = patch.socialShowHeader;
    }
    if (patch.socialShowFooter !== undefined) {
      body.mobileSocialShowFooter = patch.socialShowFooter;
    }

    const result = await patchMobileSettings(body);
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      onSaveStatus?.({ type: "error", text: result.error });
      return;
    }

    if (patch.socialShowHeader !== undefined) {
      setShowHeader(patch.socialShowHeader);
    }
    if (patch.socialShowFooter !== undefined) {
      setShowFooter(patch.socialShowFooter);
    }
    setMessage("تم الحفظ ✓");
    onSaveStatus?.({ type: "success", text: "تم حفظ إعدادات السوشيال ✓" });
  }

  async function saveClickMode(mode: "chooser" | "direct") {
    setError(null);
    setMessage(null);
    setSaving(true);
    onSaveStatus?.({ type: "saving", text: "جاري الحفظ…" });

    const res = await fetch("/api/admin/cms/social-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ socialClickMode: mode }),
    });
    setSaving(false);

    if (!res.ok) {
      const err = "فشل حفظ وضع النقر";
      setError(err);
      onSaveStatus?.({ type: "error", text: err });
      return;
    }
    setClickMode(mode);
    setMessage("تم الحفظ ✓");
    onSaveStatus?.({ type: "success", text: "تم حفظ وضع النقر ✓" });
  }

  return (
    <div className="space-y-6" dir="rtl">
      <AdminCmsMessage message={message} error={error} saving={saving} />

      <section>
        <h3 className="text-sm font-bold text-brand-navy">
          أماكن الظهور على الموبايل فقط
        </h3>
        <p className="mt-1 text-xs text-brand-navy/60">
          إعدادات الديسكتوب في{" "}
          <a href="/admin/content/social" className="text-brand-gold underline">
            صفحة السوشيال
          </a>
        </p>
        <div className="mt-3 space-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={saving}
              checked={showHeader}
              onChange={(e) =>
                void saveMobilePlacement({
                  socialShowHeader: e.target.checked,
                })
              }
            />
            الهيدر (شاشات أصغر من md)
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={saving}
              checked={showFooter}
              onChange={(e) =>
                void saveMobilePlacement({
                  socialShowFooter: e.target.checked,
                })
              }
            />
            الفوتر (شاشات أصغر من md)
          </label>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold text-brand-navy">عند الضغط على الأيقونة</h3>
        <div className="mt-2 flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-1 text-sm">
            <input
              type="radio"
              name="mobileClickMode"
              disabled={saving}
              checked={clickMode === "chooser"}
              onChange={() => void saveClickMode("chooser")}
            />
            قائمة: مشاركة أو زيارة
          </label>
          <label className="inline-flex items-center gap-1 text-sm">
            <input
              type="radio"
              name="mobileClickMode"
              disabled={saving}
              checked={clickMode === "direct"}
              onChange={() => void saveClickMode("direct")}
            />
            فتح الرابط مباشرة
          </label>
        </div>
        <p className="mt-1 text-xs text-brand-navy/50">
          يُطبَّق على الموبايل والديسكتوب معاً.
        </p>
      </section>

      <section className="rounded-xl border border-brand-gray/80 p-4">
        <SocialLinksListEditor initialLinks={initialLinks} hideTitle />
      </section>
    </div>
  );
}
