const OPTIONS = [
  {
    title: "استرداد نقدي",
    text: "خلال 48 ساعة عمل من إضافة الرصيد للمحفظة، يمكنك طلب استرداد المبلغ.",
  },
  {
    title: "شراء آخر",
    text: "استخدم رصيد المحفظة في أي عملية شراء لاحقة على الموقع.",
  },
  {
    title: "الاحتفاظ بالرصيد",
    text: "اترك المبلغ في محفظتك لاستخدامه وقتما تشاء دون ضغط زمني.",
  },
] as const;

export function WalletPolicySection() {
  return (
    <section
      className="border-y border-brand-gray bg-brand-navy py-12 text-brand-white sm:py-16"
      id="wallet"
    >
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">
          ماذا يحدث لأموالك إن لم تكتمل الحملة؟
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-brand-white/80 sm:text-base">
          عند الدفع المقدم للحجز وفشل اكتمال الحملة، يُضاف المبلغ إلى{" "}
          <strong className="text-brand-gold">محفظتك</strong> على الموقع — وليس
          ضياعاً للمبلغ. لديك خلال{" "}
          <strong className="text-brand-gold">48 ساعة عمل</strong> أحد الخيارات
          التالية (قريباً تفعيل المحفظة بالكامل):
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {OPTIONS.map((o) => (
            <li
              key={o.title}
              className="rounded-2xl border border-brand-white/15 bg-brand-white/5 p-5"
            >
              <h3 className="font-bold text-brand-gold">{o.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-white/85">
                {o.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
