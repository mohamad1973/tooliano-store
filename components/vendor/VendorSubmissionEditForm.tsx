"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VendorProductDetailsFields } from "@/components/vendor/VendorProductDetailsFields";
import { APPROVAL_STATUS } from "@/lib/db/constants";

type SubmissionData = {
  id: string;
  status: string;
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
  dealDurationDays: number;
  dealDurationHours: number;
  dealDurationMinutes: number;
  adminNote: string | null;
};

export function VendorSubmissionEditForm({
  submission,
}: {
  submission: SubmissionData;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading || imageUploading) return;
    setError(null);
    setLoading(true);

    const formEl = formRef.current ?? e.currentTarget;
    const body = Object.fromEntries(new FormData(formEl).entries());

    try {
      const res = await fetch(`/api/vendor/submissions/${submission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.validationIssues
          ? `${data.error}\n${data.validationIssues}`
          : (data.error ?? "فشل التحديث");
        setError(msg);
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
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="mt-4 space-y-3 rounded-xl border-2 border-sky-200 bg-sky-50/50 p-4"
    >
      <h3 className="text-sm font-bold text-sky-900">
        {submission.status === APPROVAL_STATUS.PENDING
          ? "تعديل المنتج قبل المراجعة"
          : submission.status === APPROVAL_STATUS.REJECTED
            ? "تعديل المنتج وإعادة الإرسال بعد الرفض"
            : "تعديل المنتج وإعادة الإرسال"}
      </h3>
      {submission.adminNote ? (
        <p className="rounded-lg bg-white px-3 py-2 text-sm text-brand-navy">
          <span className="font-semibold">ملاحظة الإدارة: </span>
          {submission.adminNote}
        </p>
      ) : null}
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
          dealDurationDays: submission.dealDurationDays,
          dealDurationHours: submission.dealDurationHours,
          dealDurationMinutes: submission.dealDurationMinutes,
        }}
        onImageUploadStateChange={setImageUploading}
      />
      {error ? (
        <p className="whitespace-pre-wrap text-sm text-red-600">{error}</p>
      ) : null}
      <button
        type="submit"
        disabled={loading || imageUploading}
        className="rounded-lg bg-brand-gold px-4 py-2 text-sm font-bold text-brand-navy disabled:opacity-60"
      >
        {imageUploading
          ? "جاري رفع الصورة…"
          : loading
            ? "جاري الإرسال…"
            : submission.status === APPROVAL_STATUS.PENDING
              ? "حفظ التعديلات"
              : "حفظ وإعادة إرسال للمراجعة"}
      </button>
    </form>
  );
}
