"use client";

import { useEffect, useState } from "react";
import { AdminCmsMessage } from "@/components/admin/cms/AdminCmsMessage";
import {
  patchMobileSettings,
  type MobileSaveStatusHandler,
} from "@/components/admin/cms/mobile-save-utils";
import type { MobileDisplaySettings } from "@/lib/cms/types";

type Props = {
  initial: Pick<MobileDisplaySettings, "footerCompact" | "footerShowColumns">;
  onSaveStatus?: MobileSaveStatusHandler;
};

export function MobileFooterSettingsForm({ initial, onSaveStatus }: Props) {
  const [footerCompact, setFooterCompact] = useState(initial.footerCompact);
  const [footerShowColumns, setFooterShowColumns] = useState(
    initial.footerShowColumns,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFooterCompact(initial.footerCompact);
    setFooterShowColumns(initial.footerShowColumns);
  }, [initial.footerCompact, initial.footerShowColumns]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(t);
  }, [message]);

  async function save(
    patch: Partial<Pick<MobileDisplaySettings, "footerCompact" | "footerShowColumns">>,
  ) {
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

    if (patch.footerCompact !== undefined) {
      setFooterCompact(patch.footerCompact);
    }
    if (patch.footerShowColumns !== undefined) {
      setFooterShowColumns(patch.footerShowColumns);
    }
    setMessage("تم الحفظ ✓");
    onSaveStatus?.({ type: "success", text: "تم حفظ إعدادات الفوتر ✓" });
  }

  return (
    <div className="space-y-4" dir="rtl">
      <AdminCmsMessage message={message} error={error} saving={saving} />

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          disabled={saving}
          checked={footerCompact}
          onChange={(e) => void save({ footerCompact: e.target.checked })}
        />
        فوتر مضغوط على الموبايل (عمود واحد، padding أقل)
      </label>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          disabled={saving}
          checked={footerShowColumns}
          onChange={(e) =>
            void save({ footerShowColumns: e.target.checked })
          }
        />
        إظهار أعمدة الروابط على الموبايل
      </label>

      <p className="text-sm text-brand-navy/60">
        حقوق النشر والسوشيال تظهر دائماً. تحرير محتوى الأعمدة في الأسفل.
      </p>
    </div>
  );
}
