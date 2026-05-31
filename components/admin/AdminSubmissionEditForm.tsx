"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VendorProductDetailsFields } from "@/components/vendor/VendorProductDetailsFields";

type SubmissionData = {
  id: string;
  productName: string;
  productType: string;
  productCondition: string;
  productDescription: string;
  specWatts: string | null;
  specVoltage: string | null;
  specCapacity: string | null;
  specPower: string | null;
  specColor: string | null;
  specExtra: string | null;
  outletReason: string | null;
  suggestedQuantity: number;
  suggestedRetailPrice: number | null;
  suggestedGroupPrice: number | null;
  productImageUrl: string | null;
  wooProductId: number | null;
};

export function AdminSubmissionEditForm({
  submission,
}: {
  submission: SubmissionData;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [syncWoo, setSyncWoo] = useState(Boolean(submission.wooProductId));

  async function saveContent() {
    if (loading || imageUploading) return;
    setError(null);
    setMessage(null);
    setLoading(true);

    const formEl = formRef.current;
    if (!formEl) {
      setLoading(false);
      return;
    }

    const body = Object.fromEntries(new FormData(formEl).entries());

    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, syncWoo }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.validationIssues
          ? `${data.error}\n${data.validationIssues}`
          : (data.error ?? "فشل الحفظ");
        setError(msg);
        return;
      }
      setMessage(
        data.wooSynced
          ? "تم حفظ التعديلات ومزامنتها مع WordPress"
          : "تم حفظ التعديلات",
      );
      router.refresh();
    } catch {
      setError("تعذّر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  async function clearImage() {
    if (!window.confirm("إزالة صورة المنتج من السجل؟")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearProductImage: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "فشل إزالة الصورة");
        return;
      }
      setMessage("تمت إزالة الصورة");
      router.refresh();
    } catch {
      setError("تعذّر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 space-y-3 rounded-xl border-2 border-brand-gold/50 bg-brand-gold/5 p-4">
      <h3 className="text-sm font-bold text-brand-navy">
        تعديل المنتج (الإدارة)
      </h3>
      <p className="text-xs text-brand-navy/60">
        الصورة برابط https (أو رفع اختياري من الجهاز). نشر المنتج على WooCommerce
        من زر «نشر على WordPress» — وليس عند لصق الرابط.
      </p>

      <form ref={formRef} className="space-y-3" onSubmit={(e) => e.preventDefault()}>
        <VendorProductDetailsFields
          defaults={{
            productName: submission.productName,
            productType: submission.productType,
            productCondition: submission.productCondition,
            productDescription: submission.productDescription,
            specWatts: submission.specWatts,
            specVoltage: submission.specVoltage,
            specCapacity: submission.specCapacity,
            specPower: submission.specPower,
            specColor: submission.specColor,
            specExtra: submission.specExtra,
            outletReason: submission.outletReason,
            suggestedQuantity: submission.suggestedQuantity,
            suggestedRetailPrice: submission.suggestedRetailPrice,
            suggestedGroupPrice: submission.suggestedGroupPrice,
            productImageUrl: submission.productImageUrl,
          }}
          onImageUploadStateChange={setImageUploading}
        />

        {submission.wooProductId ? (
          <label className="flex items-center gap-2 text-xs text-brand-navy">
            <input
              type="checkbox"
              checked={syncWoo}
              onChange={(e) => setSyncWoo(e.target.checked)}
            />
            مزامنة التعديلات مع WordPress (#{submission.wooProductId})
          </label>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading || imageUploading}
            onClick={saveContent}
            className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-bold text-brand-white disabled:opacity-60"
          >
            {loading ? "جاري الحفظ…" : "حفظ التعديلات"}
          </button>
          {submission.productImageUrl ? (
            <button
              type="button"
              disabled={loading || imageUploading}
              onClick={clearImage}
              className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-700"
            >
              إزالة الصورة
            </button>
          ) : null}
        </div>
      </form>

      {message ? <p className="text-xs text-green-800">{message}</p> : null}
      {error ? (
        <p className="whitespace-pre-wrap text-xs text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
