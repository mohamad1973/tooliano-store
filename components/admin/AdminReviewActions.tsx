"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { APPROVAL_STATUS, WOO_SYNC_STATUS } from "@/lib/db/constants";

type Props = {
  kind: "submission" | "vendor";
  id: string;
  currentStatus: string;
  wooProductId?: number | null;
  wooSyncStatus?: string;
  wooSyncError?: string | null;
  publishedOnStore?: boolean;
  /** false = صور محلية لن تُنشر على WP بدون WP_MEDIA_* */
  wpMediaConfigured?: boolean;
};

const REVISION_TEMPLATES = [
  "يرجى إضافة صورة أوضح للمنتج (ارفع صورة JPG/PNG من الجهاز).",
  "يرجى توسيع وصف المنتج وذكر المواصفات الأساسية.",
  "يرجى مراجعة الأسعار: السعر الجماعي يجب أن يكون أقل من السعر الفردي.",
  "يرجى التأكد من نوع/تصنيف المنتج والكمية المستهدفة.",
];

export function AdminReviewActions({
  kind,
  id,
  currentStatus,
  wooProductId,
  wooSyncStatus,
  wooSyncError,
  wpMediaConfigured = true,
}: Props) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patchEndpoint =
    kind === "submission"
      ? `/api/admin/submissions/${id}`
      : `/api/admin/vendors/${id}`;

  async function review(status: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(patchEndpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote: note }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = data.validationIssues
          ? `${data.error}\n${data.validationIssues}`
          : (data.error ?? "فشل التحديث");
        setError(detail);
        return;
      }
      setNote("");
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  async function syncWoo() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/submissions/${id}/sync-woo`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "فشل التحديث على WordPress");
        return;
      }
      router.refresh();
    } catch {
      setError("تعذّر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  async function publishToWoo() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/submissions/${id}/publish-woo`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = data.validationIssues
          ? `${data.error}\n${data.validationIssues}`
          : data.error ?? "فشل النشر على WordPress";
        setError(detail);
        return;
      }
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  async function deleteRejected() {
    if (
      !window.confirm(
        kind === "submission"
          ? "حذف هذا الطلب المرفوض نهائياً من اللوحة؟"
          : "حذف ملف التاجر المرفوض ومنتجاته من اللوحة؟",
      )
    ) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(patchEndpoint, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "فشل الحذف");
        return;
      }
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  if (currentStatus === APPROVAL_STATUS.REJECTED) {
    return (
      <div className="mt-3 border-t border-brand-gray pt-3">
        <button
          type="button"
          disabled={loading}
          onClick={deleteRejected}
          className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
        >
          حذف الطلب من اللوحة
        </button>
        {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
      </div>
    );
  }

  if (currentStatus === APPROVAL_STATUS.APPROVED && kind === "submission") {
    return (
      <div className="mt-3 space-y-2 border-t border-brand-gray pt-3">
        {wooProductId ? (
          <>
            <p className="text-xs text-emerald-700">
              منشور على WordPress #{wooProductId}
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={syncWoo}
              className="rounded-lg border border-brand-navy px-3 py-1.5 text-xs font-semibold text-brand-navy hover:bg-brand-gray disabled:opacity-60"
            >
              تحديث على WordPress
            </button>
          </>
        ) : (
          <>
            {!wpMediaConfigured ? (
              <p className="rounded-lg bg-amber-50 px-2 py-1.5 text-xs text-amber-900">
                لنشر صور المنتجات المحلية على WordPress: أضف{" "}
                <code className="text-[10px]">WP_MEDIA_USER</code> و{" "}
                <code className="text-[10px]">WP_APP_PASSWORD</code> في{" "}
                <code className="text-[10px]">.env.local</code> ثم{" "}
                <code className="text-[10px]">npm run check:wp-media</code> — راجع{" "}
                <code className="text-[10px]">docs/WORDPRESS-MEDIA-SETUP.md</code>
              </p>
            ) : null}
            <button
              type="button"
              disabled={loading}
              onClick={publishToWoo}
              className="rounded-lg bg-brand-navy px-3 py-1.5 text-xs font-semibold text-brand-white hover:bg-brand-navy/90 disabled:opacity-60"
            >
              نشر على WordPress
            </button>
            {wooSyncStatus === WOO_SYNC_STATUS.FAILED && wooSyncError ? (
              <p className="text-xs text-red-600">آخر خطأ: {wooSyncError}</p>
            ) : null}
          </>
        )}
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        <p className="text-[10px] text-brand-navy/50">
          المنتج يظهر في «فرص الشراء الجماعي» — النشر على WordPress اختياري
          ومستقل.
        </p>
      </div>
    );
  }

  if (currentStatus === APPROVAL_STATUS.APPROVED && kind === "vendor") {
    return null;
  }

  return (
    <div className="mt-3 space-y-2 border-t border-brand-gray pt-3">
      {kind === "submission" ? (
        <div className="flex flex-wrap gap-1">
          {REVISION_TEMPLATES.map((tpl) => (
            <button
              key={tpl}
              type="button"
              className="rounded-md bg-brand-gray/50 px-2 py-0.5 text-[10px] text-brand-navy hover:bg-brand-gold/20"
              onClick={() => setNote((n) => (n ? `${n}\n${tpl}` : tpl))}
            >
              + قالب
            </button>
          ))}
        </div>
      ) : null}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={
          kind === "submission"
            ? "ملاحظة للبائع (مطلوبة عند طلب التعديل)"
            : "ملاحظة للبائع (اختياري)"
        }
        rows={3}
        className="w-full rounded-lg border border-brand-gray px-2 py-1.5 text-sm"
      />
      {error ? (
        <p className="whitespace-pre-wrap text-xs text-red-600">{error}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {kind === "submission" &&
        (currentStatus === APPROVAL_STATUS.PENDING ||
          currentStatus === APPROVAL_STATUS.NEEDS_REVISION) ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => review(APPROVAL_STATUS.NEEDS_REVISION)}
            className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
          >
            طلب تعديل
          </button>
        ) : null}
        <button
          type="button"
          disabled={loading}
          onClick={() => review(APPROVAL_STATUS.APPROVED)}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {kind === "submission" ? "موافقة (عرض في الموقع)" : "موافقة"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => review(APPROVAL_STATUS.REJECTED)}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          رفض
        </button>
      </div>
      {kind === "submission" ? (
        <p className="text-[10px] text-brand-navy/50">
          الموافقة تبدأ الحملة وتظهر في «فرص الشراء الجماعي». النشر على WordPress
          زر منفصل بعد الموافقة.
        </p>
      ) : null}
    </div>
  );
}
