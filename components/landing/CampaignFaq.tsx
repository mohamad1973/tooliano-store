"use client";

import { useState } from "react";

const FAQ = [
  {
    q: "متى أدفع السعر الجماعي؟",
    a: "تدفع مقدماً عند الحجز. إذا اكتملت الحملة بالكمية والوقت المحددين، يُطبَّق السعر الجماعي على طلبك. إن لم تكتمل، تُطبَّق سياسة المحفظة.",
  },
  {
    q: "هل يمكنني إلغاء الحجز؟",
    a: "سياسة الإلغاء ستُعرض بوضوح قبل تأكيد الحجز. في النسخة الحالية الحجز تجريبي (قريباً).",
  },
  {
    q: "ماذا تعني «48 ساعة عمل»؟",
    a: "أيام العمل الرسمية للمنصة (عادةً من الأحد إلى الخميس، باستثناء العطلات). خلالها يمكنك اختيار الاسترداد أو استخدام الرصيد.",
  },
  {
    q: "هل الشحن مشمول؟",
    a: "تفاصيل الشحن تُحدَّد لكل حملة وستظهر عند تفعيل الحجز والدفع.",
  },
  {
    q: "كيف أتابع حالة الحملة؟",
    a: "من هذه الصفحة: شريط التقدم يوضح المحجوز والمتبقي، والعداد يوضح الوقت المتبقي.",
  },
] as const;

export function CampaignFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-12 sm:py-16" id="faq">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-center text-2xl font-bold text-brand-navy sm:text-3xl">
          أسئلة شائعة
        </h2>
        <ul className="mt-8 flex flex-col gap-2">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <li
                key={item.q}
                className="overflow-hidden rounded-xl border border-brand-gray bg-brand-white"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-start text-sm font-bold text-brand-navy sm:text-base"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  {item.q}
                  <span
                    className="shrink-0 text-brand-gold transition"
                    aria-hidden
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen ? (
                  <p className="border-t border-brand-gray px-4 pb-4 text-sm leading-relaxed text-brand-navy/70">
                    {item.a}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
