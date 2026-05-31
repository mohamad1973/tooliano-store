"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthTextField } from "@/components/auth/AuthFormField";

export function BuyerRegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
      username: form.get("username"),
      password,
      email: form.get("email"),
      phone: form.get("phone"),
    };

    try {
      const res = await fetch("/api/auth/register/buyer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "فشل التسجيل");
        return;
      }
      router.push(data.redirectTo ?? "/");
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <AuthTextField label="اسم المستخدم" name="username" required minLength={3} />
      <AuthTextField
        label="البريد الإلكتروني (اختياري)"
        name="email"
        type="email"
        autoComplete="email"
      />
      <AuthTextField
        label="رقم الموبايل"
        name="phone"
        type="tel"
        required
      />
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
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-navy transition hover:bg-brand-gold/90 disabled:opacity-60"
      >
        {loading ? "جاري التسجيل…" : "إنشاء حساب مشتري"}
      </button>
    </form>
  );
}
