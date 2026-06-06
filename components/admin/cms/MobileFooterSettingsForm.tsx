"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminCmsMessage } from "@/components/admin/cms/AdminCmsMessage";
import type { MobileDisplaySettings } from "@/lib/cms/types";

type Props = {
  initial: Pick<MobileDisplaySettings, "footerCompact" | "footerShowColumns">;
};

export function MobileFooterSettingsForm({ initial }: Props) {
  const router = useRouter();
  const [footerCompact, setFooterCompact] = useState(initial.footerCompact);
  const [footerShowColumns, setFooterShowColumns] = useState(
    initial.footerShowColumns,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(
    patch: Partial<Pick<MobileDisplaySettings, "footerCompact" | "footerShowColumns">>,
  ) {
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
    if (patch.footerCompact !== undefined) {
      setFooterCompact(patch.footerCompact);
    }
    if (patch.footerShowColumns !== undefined) {
      setFooterShowColumns(patch.footerShowColumns);
    }
    setMessage("تم الحفظ");
    router.refresh();
  }

  return (
    <div className="space-y-4" dir="rtl">
      <AdminCmsMessage message={message} error={error} />

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={footerCompact}
          onChange={(e) => void save({ footerCompact: e.target.checked })}
        />
        فوتر مضغوط على الموبايل (عمود واحد، padding أقل)
      </label>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
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
