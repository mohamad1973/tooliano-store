"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PersistProductImagesPanel({
  wpMediaConfigured,
}: {
  wpMediaConfigured: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function persist() {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/submissions/persist-images", {
        method: "POST",
      });
      const data = (await res.json()) as {
        error?: string;
        persisted?: number;
        skipped?: number;
        failed?: number;
        total?: number;
      };
      if (!res.ok) {
        setError(data.error ?? "فشل حفظ الصور");
        return;
      }
      setMessage(
        `تم: ${data.persisted ?? 0} صورة محفوظة على WordPress، ${data.skipped ?? 0} بدون تغيير، ${data.failed ?? 0} فشل.`,
      );
      router.refresh();
    } catch {
      setError("تعذّر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-brand-gold/40 bg-brand-gold/10 p-4">
      <p className="text-sm font-bold text-brand-navy">صور منتجات الشراء الجماعي</p>
      <p className="mt-1 text-xs text-brand-navy/70">
        يرفع الصور المحلية إلى WordPress ويحفظ الرابط الدائم في قاعدة البيانات.
        الصورة تُحذف من العرض للزوار فقط إذا أزلتها أنت من الأدمن (حقل فارغ).
      </p>
      {!wpMediaConfigured ? (
        <p className="mt-2 text-xs text-red-700">
          WP_MEDIA_USER و WP_APP_PASSWORD غير مضبوطين على Vercel — راجع docs/WORDPRESS-MEDIA-SETUP.md
        </p>
      ) : (
        <button
          type="button"
          onClick={persist}
          disabled={loading}
          className="mt-3 rounded-lg bg-brand-navy px-4 py-2 text-sm font-bold text-brand-white disabled:opacity-60"
        >
          {loading ? "جاري الرفع…" : "حفظ كل صور المنتجات على WordPress"}
        </button>
      )}
      {message ? <p className="mt-2 text-xs text-green-800">{message}</p> : null}
      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
