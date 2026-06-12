"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminHideSubmissionButton({
  submissionId,
  hidden,
}: {
  submissionId: string;
  hidden: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/submissions/${submissionId}/visibility`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hidden: !hidden }),
        },
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "فشل تحديث الإخفاء");
        return;
      }
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={loading}
        onClick={toggle}
        className="rounded-lg border border-brand-navy/30 bg-brand-white px-3 py-1.5 text-xs font-semibold text-brand-navy hover:bg-brand-gray/50 disabled:opacity-60"
      >
        {loading
          ? "جاري التنفيذ…"
          : hidden
            ? "إظهار على واجهة الموقع"
            : "إخفاء من واجهة الموقع"}
      </button>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
