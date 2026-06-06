"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminCmsMessage } from "@/components/admin/cms/AdminCmsMessage";
import { SocialLinksListEditor } from "@/components/admin/cms/SocialLinksListEditor";
import type { SocialLinkView } from "@/lib/cms/types";

type DisplaySettings = {
  socialShowHeader: string;
  socialShowFooter: string;
  socialShowSide: string;
  socialSidePosition: string;
  socialClickMode: string;
};

type Props = {
  initialLinks: SocialLinkView[];
  initialDisplay: DisplaySettings;
};

export function SocialLinksEditor({ initialLinks, initialDisplay }: Props) {
  const router = useRouter();
  const [display, setDisplay] = useState(initialDisplay);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshDisplay() {
    const res = await fetch("/api/admin/cms/social-settings");
    const data = await res.json();
    if (res.ok) setDisplay(data);
  }

  async function saveDisplay(patch: Partial<DisplaySettings>) {
    setError(null);
    const body: Record<string, boolean | string> = {};
    if (patch.socialShowHeader !== undefined) {
      body.socialShowHeader = patch.socialShowHeader === "true";
    }
    if (patch.socialShowFooter !== undefined) {
      body.socialShowFooter = patch.socialShowFooter === "true";
    }
    if (patch.socialShowSide !== undefined) {
      body.socialShowSide = patch.socialShowSide === "true";
    }
    if (patch.socialSidePosition !== undefined) {
      body.socialSidePosition = patch.socialSidePosition;
    }
    if (patch.socialClickMode !== undefined) {
      body.socialClickMode = patch.socialClickMode;
    }

    const res = await fetch("/api/admin/cms/social-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setError("فشل حفظ الإعدادات");
      return;
    }
    setMessage("تم حفظ إعدادات العرض");
    await refreshDisplay();
    router.refresh();
  }

  return (
    <div className="space-y-8" dir="rtl">
      <AdminCmsMessage message={message} error={error} />

      <section className="rounded-2xl border border-brand-gray bg-brand-white p-5">
        <h2 className="text-lg font-bold text-brand-navy">أماكن الظهور</h2>
        <p className="mt-1 text-sm text-brand-navy/60">
          يمكن تفعيل أكثر من مكان في نفس الوقت (ديسكتوب — md وأكبر)
        </p>
        <div className="mt-4 space-y-3">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={display.socialShowHeader === "true"}
              onChange={(e) =>
                void saveDisplay({
                  socialShowHeader: String(e.target.checked),
                })
              }
            />
            <span className="text-sm">الهيدر</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={display.socialShowFooter === "true"}
              onChange={(e) =>
                void saveDisplay({
                  socialShowFooter: String(e.target.checked),
                })
              }
            />
            <span className="text-sm">الفوتر</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={display.socialShowSide === "true"}
              onChange={(e) =>
                void saveDisplay({ socialShowSide: String(e.target.checked) })
              }
            />
            <span className="text-sm">شريط جانبي (فوق بعض — desktop)</span>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <fieldset>
            <legend className="mb-1 text-xs font-semibold text-brand-navy/70">
              موضع الشريط الجانبي
            </legend>
            <label className="me-3 inline-flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="sidePosition"
                checked={display.socialSidePosition === "start"}
                onChange={() =>
                  void saveDisplay({ socialSidePosition: "start" })
                }
              />
              يمين (RTL)
            </label>
            <label className="inline-flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="sidePosition"
                checked={display.socialSidePosition === "end"}
                onChange={() => void saveDisplay({ socialSidePosition: "end" })}
              />
              يسار (RTL)
            </label>
          </fieldset>

          <fieldset>
            <legend className="mb-1 text-xs font-semibold text-brand-navy/70">
              عند الضغط على الأيقونة
            </legend>
            <label className="me-3 inline-flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="clickMode"
                checked={display.socialClickMode === "chooser"}
                onChange={() =>
                  void saveDisplay({ socialClickMode: "chooser" })
                }
              />
              قائمة: مشاركة أو زيارة
            </label>
            <label className="inline-flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="clickMode"
                checked={display.socialClickMode === "direct"}
                onChange={() =>
                  void saveDisplay({ socialClickMode: "direct" })
                }
              />
              فتح الرابط مباشرة
            </label>
          </fieldset>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-gray bg-brand-white p-5">
        <SocialLinksListEditor initialLinks={initialLinks} />
      </section>
    </div>
  );
}
