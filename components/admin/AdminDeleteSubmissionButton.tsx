"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminDeleteSubmissionButton({
  submissionId,
}: {
  submissionId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteForever() {
    if (
      !window.confirm(
        "حذف هذا المنتج من لوحة الإدارة؟ لن يظهر في الداشبورد (نشط أو مخفي). يمكنك إخفاؤه من واجهة الموقع أولاً إن أردت.",
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/submissions/${submissionId}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "فشل المسح");
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
        onClick={deleteForever}
        className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
      >
        {loading ? "جاري الحذف…" : "حذف من لوحة الإدارة"}
      </button>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
