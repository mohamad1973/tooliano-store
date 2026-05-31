const STEPS = [
  {
    title: "احجز قطعتك",
    text: "ادفع مقدماً واحجز الكمية التي تريدها ضمن الحملة النشطة.",
  },
  {
    title: "انتظر اكتمال الحملة",
    text: "شاهد العدادين: الكمية المتبقية والوقت المتبقي للعرض.",
  },
  {
    title: "نجاح الحملة",
    text: "عند بلوغ الهدف في الوقت المحدد، يُنفَّذ طلبك بالسعر الجماعي.",
  },
  {
    title: "توصيل أو محفظة",
    text: "إن لم تكتمل الحملة، يُضاف المبلغ لمحفظتك بخيارات الاسترداد أو الشراء لاحقاً.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="bg-brand-gray/50 py-12 sm:py-16" id="how-it-works">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-bold text-brand-navy sm:text-3xl">
          كيف يعمل الشراء الجماعي؟
        </h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="relative rounded-2xl border border-brand-gray bg-brand-white p-5 shadow-sm"
            >
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-gold text-lg font-bold text-brand-navy">
                {i + 1}
              </span>
              <h3 className="font-bold text-brand-navy">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-navy/70">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
