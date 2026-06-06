"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminCmsMessage } from "@/components/admin/cms/AdminCmsMessage";
import { SocialLinksListEditor } from "@/components/admin/cms/SocialLinksListEditor";
import type { SocialLinkView } from "@/lib/cms/types";

type Props = {
  initialLinks: SocialLinkView[];
  initialMobileSocialShowHeader: boolean;
  initialMobileSocialShowFooter: boolean;
  initialClickMode: "chooser" | "direct";
};

export function MobileSocialPanel({
  initialLinks,
  initialMobileSocialShowHeader,
  initialMobileSocialShowFooter,
  initialClickMode,
}: Props) {
  const router = useRouter();
  const [showHeader, setShowHeader] = useState(initialMobileSocialShowHeader);
  const [showFooter, setShowFooter] = useState(initialMobileSocialShowFooter);
  const [clickMode, setClickMode] = useState(initialClickMode);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saveMobilePlacement(
    patch: Partial<{ socialShowHeader: boolean; socialShowFooter: boolean }>,
  ) {
    setError(null);
    const body: Record<string, boolean> = {};
    if (patch.socialShowHeader !== undefined) {
      body.mobileSocialShowHeader = patch.socialShowHeader;
    }
    if (patch.socialShowFooter !== undefined) {
      body.mobileSocialShowFooter = patch.socialShowFooter;
    }
    const res = await fetch("/api/admin/cms/mobile-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setError("فشل حفظ إعدادات الموبايل");
      return;
    }
    if (patch.socialShowHeader !== undefined) {
      setShowHeader(patch.socialShowHeader);
    }
    if (patch.socialShowFooter !== undefined) {
      setShowFooter(patch.socialShowFooter);
    }
    setMessage("تم حفظ إعدادات الظهور على الموبايل");
    router.refresh();
  }

  async function saveClickMode(mode: "chooser" | "direct") {
    setError(null);
    const res = await fetch("/api/admin/cms/social-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ socialClickMode: mode }),
    });
    if (!res.ok) {
      setError("فشل حفظ وضع النقر");
      return;
    }
    setClickMode(mode);
    setMessage("تم حفظ وضع النقر");
    router.refresh();
  }

  return (
    <div className="space-y-6" dir="rtl">
      <AdminCmsMessage message={message} error={error} />

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
              checked={clickMode === "chooser"}
              onChange={() => void saveClickMode("chooser")}
            />
            قائمة: مشاركة أو زيارة
          </label>
          <label className="inline-flex items-center gap-1 text-sm">
            <input
              type="radio"
              name="mobileClickMode"
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
