"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthSelect,
  AuthTextArea,
  AuthTextField,
} from "@/components/auth/AuthFormField";
import { VendorProductDetailsFields } from "@/components/vendor/VendorProductDetailsFields";
import { BUSINESS_TYPES } from "@/lib/db/constants";

function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function VendorRegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const idempotencyKeyRef = useRef(newIdempotencyKey());

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading || imageUploading) return;

    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    const confirm = String(form.get("confirmPassword"));
    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين");
      setLoading(false);
      return;
    }

    const body = {
      ...Object.fromEntries(
        [...form.entries()].filter(([key]) => key !== "confirmPassword"),
      ),
      idempotencyKey: idempotencyKeyRef.current,
    };

    try {
      const res = await fetch("/api/auth/register/vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "فشل التسجيل");
        return;
      }
      router.push(data.redirectTo ?? "/vendor");
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <fieldset className="space-y-4 rounded-xl border border-brand-gray/80 p-4">
        <legend className="px-2 text-sm font-bold text-brand-navy">
          حساب الدخول
        </legend>
        <AuthTextField label="اسم المستخدم" name="username" required minLength={3} />
        <AuthTextField
          label="كلمة المرور"
          name="password"
          type="password"
          required
          minLength={6}
        />
        <AuthTextField
          label="تأكيد كلمة المرور"
          name="confirmPassword"
          type="password"
          required
          minLength={6}
        />
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border border-brand-gray/80 p-4">
        <legend className="px-2 text-sm font-bold text-brand-navy">
          بيانات الشركة والتواصل
        </legend>
        <AuthTextField label="اسم الشركة" name="companyName" required />
        <AuthTextField label="اسم المسؤول" name="contactName" required />
        <AuthTextField label="رقم الهاتف" name="phone" type="tel" required />
        <AuthTextField
          label="البريد الإلكتروني"
          name="contactEmail"
          type="email"
          required
        />
        <AuthTextArea label="العنوان الكامل" name="address" required rows={2} />
        <AuthSelect label="نوع النشاط" name="businessType" required>
          <option value="">اختر…</option>
          <option value={BUSINESS_TYPES.AGENT}>وكيل</option>
          <option value={BUSINESS_TYPES.DISTRIBUTOR}>موزع</option>
        </AuthSelect>
        <AuthTextField
          label="حجم العمالة (عدد الموظفين)"
          name="teamSize"
          type="number"
          min={1}
          required
        />
        <AuthTextArea
          label="أنواع المنتجات التي تتعامل معها"
          name="productTypesDescription"
          required
          hint="مثال: أدوات مطبخ، إلكترونيات منزلية، مستلزمات مكتبية…"
        />
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border border-brand-gray/80 p-4">
        <legend className="px-2 text-sm font-bold text-brand-navy">
          أول منتج للمراجعة
        </legend>
        <VendorProductDetailsFields
          imageUploadEndpoint="/api/register/vendor-upload-image"
          onImageUploadStateChange={setImageUploading}
        />
      </fieldset>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading || imageUploading}
        className="w-full rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-navy transition hover:bg-brand-gold/90 disabled:opacity-60"
      >
        {imageUploading
          ? "جاري رفع الصورة…"
          : loading
            ? "جاري الإرسال…"
            : "إرسال الطلب للمراجعة"}
      </button>
      <p className="text-xs text-brand-navy/60">
        بعد الإرسال ستُراجع الإدارة ملفك التجاري ومنتجك. يمكنك متابعة الحالة من لوحة
        البائع.
      </p>
    </form>
  );
}
