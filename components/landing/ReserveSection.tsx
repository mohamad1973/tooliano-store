"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import { calculateOrderAmounts, roundMoney } from "@/lib/orders/pricing";

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

  const { depositAmount, lineTotal, minDepositAmount } = useMemo(() => {
    const calc = calculateOrderAmounts({
      unitGroupPrice: groupPrice,
      quantity: qty,
    });
    return {
      lineTotal: calc.lineTotal,
      depositAmount: calc.depositAmount,
      minDepositAmount: calc.depositAmount,
    };
  }, [groupPrice, qty]);

  const effectivePay =
    payAmount === "" ? minDepositAmount : roundMoney(Number(payAmount));
  const remainingAfter = roundMoney(Math.max(0, lineTotal - effectivePay));

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
    if (effectivePay < minDepositAmount - 0.01) {
      setError(`الحد الأدنى للدفعة ${formatCurrency(minDepositAmount)} (5%)`);
      return;
    }
    if (effectivePay > lineTotal + 0.01) {
      setError("المبلغ يتجاوز قيمة الطلب");
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
          مبلغ الدفع الآن (حد أدنى {formatCurrency(minDepositAmount)} — حتى كامل القيمة)
          <input
            type="number"
            min={minDepositAmount}
            max={lineTotal}
            step="0.01"
            value={payAmount === "" ? minDepositAmount : payAmount}
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
            الباقي على الطلب: <strong>{formatCurrency(remainingAfter)}</strong>
            {remainingAfter > 0.01
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
          يُضاف المبلغ للمحفظة ثم يُحجز على الطلب — السجل لا يُحذف
        </p>
      </form>
    </section>
  );
}
