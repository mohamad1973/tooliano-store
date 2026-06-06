"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminCmsMessage } from "@/components/admin/cms/AdminCmsMessage";
import {
  patchMobileSettings,
  type MobileSaveStatusHandler,
} from "@/components/admin/cms/mobile-save-utils";
import type { MobileDisplaySettings } from "@/lib/cms/types";

type Props = {
  initial: MobileDisplaySettings;
  onSaveStatus?: MobileSaveStatusHandler;
};

export function MobileHeaderSettingsForm({ initial, onSaveStatus }: Props) {
  const [settings, setSettings] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSettings(initial);
  }, [initial]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(t);
  }, [message]);

  async function save(patch: Partial<MobileDisplaySettings>) {
    setError(null);
    setMessage(null);
    setSaving(true);
    onSaveStatus?.({ type: "saving", text: "جاري الحفظ…" });

    const result = await patchMobileSettings(patch);
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      onSaveStatus?.({ type: "error", text: result.error });
      return;
    }

    setSettings((prev) => ({ ...prev, ...patch }));
    setMessage("تم الحفظ ✓");
    onSaveStatus?.({ type: "success", text: "تم حفظ إعدادات الهيدر ✓" });
  }

  return (
    <div className="space-y-5" dir="rtl">
      <AdminCmsMessage message={message} error={error} saving={saving} />

      <fieldset className="space-y-2" disabled={saving}>
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
        <fieldset className="space-y-2" disabled={saving}>
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
            disabled={saving}
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
            disabled={saving}
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
