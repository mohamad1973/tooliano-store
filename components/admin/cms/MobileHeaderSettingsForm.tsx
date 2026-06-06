"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminCmsMessage } from "@/components/admin/cms/AdminCmsMessage";
import type { MobileDisplaySettings } from "@/lib/cms/types";

type Props = {
  initial: MobileDisplaySettings;
};

export function MobileHeaderSettingsForm({ initial }: Props) {
  const router = useRouter();
  const [settings, setSettings] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(patch: Partial<MobileDisplaySettings>) {
    setError(null);
    const res = await fetch("/api/admin/cms/mobile-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      setError("فشل الحفظ");
      return;
    }
    setSettings((prev) => ({ ...prev, ...patch }));
    setMessage("تم الحفظ");
    router.refresh();
  }

  return (
    <div className="space-y-5" dir="rtl">
      <AdminCmsMessage message={message} error={error} />

      <fieldset className="space-y-2">
        <legend className="text-sm font-bold text-brand-navy">
          نمط القائمة على الموبايل
        </legend>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="navMode"
            checked={settings.navMode === "burger"}
            onChange={() => void save({ navMode: "burger" })}
          />
          قائمة جانبية (burger)
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="navMode"
            checked={settings.navMode === "scroll"}
            onChange={() => void save({ navMode: "scroll" })}
          />
          شريط أفقي قابل للتمرير (السلوك السابق)
        </label>
      </fieldset>

      {settings.navMode === "burger" ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-bold text-brand-navy">
            جهة فتح الدرج (RTL)
          </legend>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="drawerSide"
              checked={settings.drawerSide === "start"}
              onChange={() => void save({ drawerSide: "start" })}
            />
            يمين
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="drawerSide"
              checked={settings.drawerSide === "end"}
              onChange={() => void save({ drawerSide: "end" })}
            />
            يسار
          </label>
        </fieldset>
      ) : null}

      <div className="space-y-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.showMarquee}
            onChange={(e) =>
              void save({ showMarquee: e.target.checked })
            }
          />
          إظهار الشريط المتحرك على الموبايل
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.showTagline}
            onChange={(e) =>
              void save({ showTagline: e.target.checked })
            }
          />
          إظهار الشعار الفرعي تحت اسم الموقع على الموبايل
        </label>
      </div>

      <p className="rounded-lg bg-brand-gray/40 px-3 py-2 text-sm text-brand-navy/70">
        عناصر القائمة تُدار من{" "}
        <Link
          href="/admin/content/menu"
          className="font-semibold text-brand-gold underline"
        >
          قائمة الأقسام
        </Link>
        — نفس المحتوى يظهر على الموبايل والديسكتوب.
      </p>
    </div>
  );
}
