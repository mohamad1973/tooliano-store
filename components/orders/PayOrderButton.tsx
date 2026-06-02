"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import {
  getPaymentBounds,
  previewAfterPayment,
  validatePaymentAmountClient,
} from "@/lib/orders/payment-amount-ui";
import { roundMoney } from "@/lib/orders/pricing";

export function PayOrderButton({
  orderId,
  lineTotal,
  paidOnlineTotal,
  remainingBalance,
  minDepositAmount,
  isFirstPayment,
}: {
  orderId: string;
  lineTotal: number;
  paidOnlineTotal: number;
  remainingBalance: number;
  minDepositAmount: number;
  isFirstPayment: boolean;
}) {
  const router = useRouter();
  const bounds = useMemo(
    () =>
      getPaymentBounds({
        lineTotal,
        paidOnlineTotal,
        minDepositAmount,
        isFirstPayment,
      }),
    [lineTotal, paidOnlineTotal, minDepositAmount, isFirstPayment],
  );

  const [amount, setAmount] = useState(bounds.defaultAmount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveAmount = roundMoney(amount);
  const preview = previewAfterPayment({
    lineTotal,
    paidOnlineTotal,
    amount: effectiveAmount,
  });

  if (remainingBalance <= 0.01) return null;

  async function pay(simulate: boolean) {
    const validationError = validatePaymentAmountClient({
      lineTotal,
      paidOnlineTotal,
      minDepositAmount,
      isFirstPayment,
      amount: effectiveAmount,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulate, amount: effectiveAmount }),
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

  const minLabel = isFirstPayment
    ? `حد أدنى ${formatCurrency(bounds.min)} (5%) — حتى ${formatCurrency(bounds.max)}`
    : `حتى ${formatCurrency(bounds.max)}`;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-brand-gold/40 bg-brand-gold/5 p-4">
      <label className="text-sm font-medium text-brand-navy">
        مبلغ الدفع ({minLabel})
        <input
          type="number"
          min={bounds.min}
          max={bounds.max}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(Number.parseFloat(e.target.value) || 0)}
          className="mt-1 w-full rounded-lg border border-brand-gray px-3 py-2"
        />
      </label>

      <ul className="rounded-lg bg-brand-white/80 p-3 text-xs text-brand-navy/80">
        <li>
          تدفع الآن:{" "}
          <strong className="text-brand-gold">
            {formatCurrency(effectiveAmount)}
          </strong>
        </li>
        <li className="mt-1">
          المدفوع على الطلب بعد الدفعة:{" "}
          <strong>{formatCurrency(preview.paidAfter)}</strong>
        </li>
        <li className="mt-1">
          الباقي على الطلب:{" "}
          <strong>{formatCurrency(preview.remainingAfter)}</strong>
          {preview.remainingAfter > 0.01
            ? " (نقداً عند الاستلام أو أونلاين لاحقاً)"
            : " — مدفوع بالكامل"}
        </li>
      </ul>

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
