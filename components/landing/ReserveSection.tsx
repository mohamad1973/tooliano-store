"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import { calculateOrderAmounts, roundMoney } from "@/lib/orders/pricing";
import {
  getPaymentBounds,
  previewAfterPayment,
  validatePaymentAmountClient,
} from "@/lib/orders/payment-amount-ui";

type Props = {
  submissionId: string;
  groupPrice: number;
  productName: string;
  isLoggedIn: boolean;
  isBuyer: boolean;
};

export function ReserveSection({
  submissionId,
  groupPrice,
  productName,
  isLoggedIn,
  isBuyer,
}: Props) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [payAmount, setPayAmount] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { lineTotal, minDepositAmount } = useMemo(() => {
    const calc = calculateOrderAmounts({
      unitGroupPrice: groupPrice,
      quantity: qty,
    });
    return {
      lineTotal: calc.lineTotal,
      minDepositAmount: calc.depositAmount,
    };
  }, [groupPrice, qty]);

  const bounds = useMemo(
    () =>
      getPaymentBounds({
        lineTotal,
        paidOnlineTotal: 0,
        minDepositAmount,
        isFirstPayment: true,
      }),
    [lineTotal, minDepositAmount],
  );

  const effectivePay = roundMoney(
    payAmount === "" ? bounds.defaultAmount : Number(payAmount),
  );
  const preview = previewAfterPayment({
    lineTotal,
    paidOnlineTotal: 0,
    amount: effectivePay,
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isLoggedIn) {
      router.push(`/login?next=/campaign/offer/${submissionId}#reserve`);
      return;
    }
    if (!isBuyer) {
      setError("الحجز متاح لحسابات المشترين فقط");
      return;
    }

    const validationError = validatePaymentAmountClient({
      lineTotal,
      paidOnlineTotal: 0,
      minDepositAmount,
      isFirstPayment: true,
      amount: effectivePay,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, quantity: qty }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "فشل إنشاء الحجز");
        return;
      }

      let payRes = await fetch(`/api/orders/${data.orderId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: effectivePay }),
      });
      let payData = await payRes.json();

      if (!payRes.ok && payData.canSimulate) {
        payRes = await fetch(`/api/orders/${data.orderId}/pay`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ simulate: true, amount: effectivePay }),
        });
        payData = await payRes.json();
      }

      if (payRes.ok && payData.redirectTo) {
        router.push(payData.redirectTo);
        router.refresh();
        return;
      }
      if (payData.paymentUrl) {
        window.location.href = payData.paymentUrl;
        return;
      }
      router.push(`/account/orders/${data.orderId}`);
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="scroll-mt-24 rounded-2xl border-2 border-brand-gold bg-brand-white p-6 shadow-lg sm:p-8"
      id="reserve"
    >
      <h2 className="text-xl font-bold text-brand-navy">احجز الآن</h2>
      <p className="mt-1 text-sm text-brand-navy/70">
        {productName} — قيمة الطلب{" "}
        <strong className="text-brand-gold">{formatCurrency(lineTotal)}</strong>
      </p>

      {!isLoggedIn ? (
        <p className="mt-4 rounded-xl bg-brand-gray/40 p-4 text-sm text-brand-navy">
          <Link
            href={`/login?next=/campaign/offer/${submissionId}`}
            className="font-bold text-brand-gold hover:underline"
          >
            سجّل الدخول
          </Link>{" "}
          أو{" "}
          <Link href="/register" className="font-bold text-brand-gold hover:underline">
            أنشئ حساب مشتري
          </Link>
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-brand-navy">
          الكمية
          <input
            type="number"
            min={1}
            max={50}
            value={qty}
            onChange={(e) =>
              setQty(Math.max(1, Number.parseInt(e.target.value, 10) || 1))
            }
            className="rounded-lg border border-brand-gray px-3 py-2 text-brand-navy"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-brand-navy">
          مبلغ الدفع الآن (حد أدنى {formatCurrency(bounds.min)} — حتى{" "}
          {formatCurrency(bounds.max)})
          <input
            type="number"
            min={bounds.min}
            max={bounds.max}
            step="0.01"
            value={payAmount === "" ? bounds.defaultAmount : payAmount}
            onChange={(e) =>
              setPayAmount(
                e.target.value === ""
                  ? ""
                  : Number.parseFloat(e.target.value) || 0,
              )
            }
            className="rounded-lg border border-brand-gray px-3 py-2 text-brand-navy"
          />
        </label>

        <ul className="rounded-xl bg-brand-gray/30 p-4 text-sm text-brand-navy/80">
          <li>
            تدفع الآن:{" "}
            <strong className="text-brand-gold">{formatCurrency(effectivePay)}</strong>
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

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-gold py-3.5 text-base font-bold text-brand-navy transition hover:bg-brand-gold/90 disabled:opacity-60"
        >
          {loading ? "جاري المعالجة…" : "احجز وادفع"}
        </button>
        <p className="text-center text-xs text-brand-navy/50">
          يُسجَّل في كشف محفظتك فقط — لا يظهر لحسابات أخرى
        </p>
      </form>
    </section>
  );
}
