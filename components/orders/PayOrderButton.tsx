"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";

export function PayOrderButton({
  orderId,
  remainingBalance,
  minDepositAmount,
}: {
  orderId: string;
  remainingBalance: number;
  minDepositAmount: number;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(remainingBalance);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (remainingBalance <= 0.01) return null;

  async function pay(simulate: boolean) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulate, amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "فشل الدفع");
        return;
      }
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      router.refresh();
    } catch {
      setError("تعذر الاتصال");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-brand-gold/40 bg-brand-gold/5 p-4">
      <label className="text-sm font-medium text-brand-navy">
        مبلغ الدفع (باقي {formatCurrency(remainingBalance)})
        <input
          type="number"
          min={Math.min(minDepositAmount, remainingBalance)}
          max={remainingBalance}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(Number.parseFloat(e.target.value) || 0)}
          className="mt-1 w-full rounded-lg border border-brand-gray px-3 py-2"
        />
      </label>
      <button
        type="button"
        disabled={loading}
        onClick={() => pay(true)}
        className="rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-navy disabled:opacity-60"
      >
        {loading ? "جاري الدفع…" : "ادفع (تطوير)"}
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => pay(false)}
        className="rounded-xl border border-brand-gold py-3 text-sm font-bold text-brand-navy disabled:opacity-60"
      >
        ادفع عبر Paymob
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
