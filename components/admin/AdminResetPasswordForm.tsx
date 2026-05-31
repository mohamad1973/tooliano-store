"use client";

import { useState } from "react";

export function AdminResetPasswordForm({ userId }: { userId: string }) {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "فشل");
        return;
      }
      setMsg("تم تعيين كلمة المرور الجديدة");
      setPassword("");
    } catch {
      setError("تعذر الاتصال");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 max-w-sm space-y-2">
      <label className="block text-sm font-medium text-brand-navy">
        كلمة مرور جديدة
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
          className="mt-1 w-full rounded-lg border border-brand-gray px-3 py-2 text-sm"
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {msg ? <p className="text-sm text-green-700">{msg}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-brand-gold px-4 py-2 text-sm font-bold text-brand-navy disabled:opacity-60"
      >
        إعادة تعيين
      </button>
    </form>
  );
}
