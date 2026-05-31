"use client";

import { useState, type FormEvent } from "react";
import { formatCurrency } from "@/lib/format";

type Props = {
  groupPrice: number;
  productName: string;
};

export function ReserveSection({ groupPrice, productName }: Props) {
  const [qty, setQty] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section
      className="scroll-mt-24 rounded-2xl border-2 border-brand-gold bg-brand-white p-6 shadow-lg sm:p-8"
      id="reserve"
    >
      <h2 className="text-xl font-bold text-brand-navy">احجز الآن</h2>
      <p className="mt-1 text-sm text-brand-navy/70">
        {productName} — سعر الحجز المتوقع{" "}
        <strong className="text-brand-gold">
          {formatCurrency(groupPrice * qty)}
        </strong>{" "}
        (عند نجاح الحملة)
      </p>

      {submitted ? (
        <div className="mt-6 rounded-xl bg-brand-gold/15 p-4 text-center text-sm font-semibold text-brand-navy">
          شكراً لاهتمامك! تفعيل الحجز والدفع قريباً — سجّل بريدك لاحقاً من لوحة
          الحساب.
        </div>
      ) : (
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
            البريد الإلكتروني (اختياري)
            <input
              type="email"
              placeholder="you@example.com"
              className="rounded-lg border border-brand-gray px-3 py-2 text-brand-navy"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-xl bg-brand-gold py-3.5 text-base font-bold text-brand-navy transition hover:bg-brand-gold/90"
          >
            تأكيد الحجز — قريباً
          </button>
          <p className="text-center text-xs text-brand-navy/50">
            الدفع المقدم والمحفظة سيُفعَّلان في الإصدار القادم
          </p>
        </form>
      )}
    </section>
  );
}
