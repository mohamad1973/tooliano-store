"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthTextField } from "@/components/auth/AuthFormField";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      username: form.get("username"),
      password: form.get("password"),
    };

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "فشل تسجيل الدخول");
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
      <AuthTextField
        label="اسم المستخدم"
        name="username"
        autoComplete="username"
        required
      />
      <AuthTextField
        label="كلمة المرور"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-navy transition hover:bg-brand-gold/90 disabled:opacity-60"
      >
        {loading ? "جاري الدخول…" : "تسجيل الدخول"}
      </button>
      <p className="text-center text-sm text-brand-navy/70">
        ليس لديك حساب؟{" "}
        <Link href="/register" className="font-semibold text-brand-gold hover:underline">
          إنشاء حساب
        </Link>
      </p>
    </form>
  );
}
