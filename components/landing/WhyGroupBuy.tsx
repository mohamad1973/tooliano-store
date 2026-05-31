const POINTS = [
  {
    title: "خصم حقيقي",
    text: "كلما زاد عدد المشاركين، يقترب الجميع من سعر لا يُتاح بالشراء الفردي.",
  },
  {
    title: "شفافية كاملة",
    text: "عداد الكمية وعداد الوقت يوضحان وضع الحملة لحظة بلحظة.",
  },
  {
    title: "حماية مبلغك",
    text: "إن لم تُكتمل الحملة، يُحوَّل ما دفعته لمحفظتك بخيارات واضحة.",
  },
  {
    title: "منتجات موثوقة",
    text: "نختار منتجات من متجر Tooliano بمعايير جودة ووصف واضح.",
  },
] as const;

export function WhyGroupBuy() {
  return (
    <section className="py-12 sm:py-16" id="why">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-bold text-brand-navy sm:text-3xl">
          لماذا Tooliano للشراء الجماعي؟
        </h2>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2">
          {POINTS.map((p) => (
            <li
              key={p.title}
              className="flex gap-4 rounded-2xl border border-brand-gray bg-brand-white p-5"
            >
              <span
                className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-brand-gold"
                aria-hidden
              />
              <div>
                <h3 className="font-bold text-brand-navy">{p.title}</h3>
                <p className="mt-1 text-sm text-brand-navy/70">{p.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
