"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VendorProductDetailsFields } from "@/components/vendor/VendorProductDetailsFields";

function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function VendorProductForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(newIdempotencyKey);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading || imageUploading) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    const formEl = formRef.current ?? e.currentTarget;
    const form = new FormData(formEl);
    const body = {
      ...Object.fromEntries(form.entries()),
      idempotencyKey,
    };

    try {
      const res = await fetch("/api/vendor/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let data: {
        error?: string;
        detail?: string;
        validationIssues?: string;
        duplicate?: boolean;
        message?: string;
      };
      try {
        data = await res.json();
      } catch {
        setError("استجابة غير صالحة من الخادم");
        return;
      }

      if (!res.ok) {
        const msg = data.validationIssues
          ? `${data.error}\n${data.validationIssues}`
          : data.detail
            ? `${data.error}: ${data.detail}`
            : (data.error ?? "فشل الإرسال");
        setError(msg);
        return;
      }

      formEl.reset();
      setIdempotencyKey(newIdempotencyKey());
      setSuccess(data.message ?? "تم إرسال المنتج للمراجعة بنجاح.");
      router.refresh();
    } catch (err) {
      console.error("VendorProductForm submit:", err);
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="mt-4 space-y-3 rounded-xl border border-brand-gray p-4"
    >
      <h3 className="text-sm font-bold text-brand-navy">إضافة منتج جديد للمراجعة</h3>
      <VendorProductDetailsFields onImageUploadStateChange={setImageUploading} />
      {success ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {success}
        </p>
      ) : null}
      {error ? (
        <p className="whitespace-pre-wrap text-sm text-red-600">{error}</p>
      ) : null}
      <button
        type="submit"
        disabled={loading || imageUploading}
        className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-brand-white hover:bg-brand-navy/90 disabled:opacity-60"
      >
        {imageUploading
          ? "جاري رفع الصورة…"
          : loading
            ? "جاري الإرسال…"
            : "إرسال للمراجعة"}
      </button>
    </form>
  );
}
