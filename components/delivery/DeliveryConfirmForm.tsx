"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeliveryConfirmForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/delivery/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, codCollected: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "فشل التأكيد");
        return;
      }
      setMessage("تم تأكيد التسليم بنجاح");
      setCode("");
      router.refresh();
    } catch {
      setError("تعذر الاتصال");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm font-medium text-brand-navy">
        كود التسليم (6 أرقام)
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="mt-1 w-full rounded-lg border border-brand-gray px-3 py-3 text-center font-mono text-2xl tracking-widest"
          placeholder="000000"
          required
        />
      </label>
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      {message ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{message}</p>
      ) : null}
      <button
        type="submit"
        disabled={loading || code.length !== 6}
        className="w-full rounded-xl bg-brand-gold py-3 font-bold text-brand-navy disabled:opacity-60"
      >
        {loading ? "جاري التحقق…" : "تأكيد التسليم"}
      </button>
    </form>
  );
}
