"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  submissionId: string;
  productName: string;
  apiEndpoint: string;
};

export function CampaignDecisionActions({
  submissionId,
  productName,
  apiEndpoint,
}: Props) {
  const router = useRouter();
  const [days, setDays] = useState(7);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(action: "EXTEND" | "EXECUTE" | "CANCEL") {
    if (
      action === "EXECUTE" &&
      !confirm(`تنفيذ صفقة «${productName}» على حالتها الحالية؟`)
    ) {
      return;
    }
    if (
      action === "CANCEL" &&
      !confirm(
        `إنهاء صفقة «${productName}» دون تنفيذ؟ سيتم فك أرصدة المشترين المحجوزة.`,
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          duration:
            action === "EXTEND" ? { days, hours, minutes } : undefined,
        }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setError(data.error ?? "فشلت العملية");
        return;
      }
      setMessage(data.message ?? "تم تنفيذ القرار");
      router.refresh();
    } catch {
      setError("تعذّر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
      <p className="text-sm font-bold text-amber-950">
        انتهت مدة العرض — مطلوب قرار
      </p>
      <p className="mt-1 text-xs text-amber-900/80">
        اختر تمديد المدة، أو تنفيذ الصفقة على حالتها الحالية، أو إنهاءها دون
        تنفيذ. سيتم إشعار المشترين والإدارة بالقرار.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <label className="text-xs font-semibold text-brand-navy">
          أيام التمديد
          <input
            type="number"
            min={0}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border px-2 py-1 text-sm"
            disabled={loading}
          />
        </label>
        <label className="text-xs font-semibold text-brand-navy">
          ساعات
          <input
            type="number"
            min={0}
            max={23}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border px-2 py-1 text-sm"
            disabled={loading}
          />
        </label>
        <label className="text-xs font-semibold text-brand-navy">
          دقائق
          <input
            type="number"
            min={0}
            max={59}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border px-2 py-1 text-sm"
            disabled={loading}
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => void submit("EXTEND")}
          className="rounded-lg bg-brand-navy px-3 py-2 text-xs font-bold text-brand-white disabled:opacity-60"
        >
          تمديد المدة
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void submit("EXECUTE")}
          className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
        >
          تنفيذ على حالتها
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void submit("CANCEL")}
          className="rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
        >
          إنهاء دون تنفيذ
        </button>
      </div>

      {message ? (
        <p className="mt-2 text-xs font-semibold text-emerald-800">{message}</p>
      ) : null}
      {error ? (
        <p className="mt-2 text-xs font-semibold text-red-700">{error}</p>
      ) : null}
      <input type="hidden" value={submissionId} readOnly />
    </div>
  );
}
