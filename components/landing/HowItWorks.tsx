import type { HowItWorksContent } from "@/lib/cms/types";

export function HowItWorks({ content }: { content: HowItWorksContent }) {
  return (
    <section className="bg-brand-gray/50 py-12 sm:py-16" id="how-it-works">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-bold text-brand-navy sm:text-3xl">
          {content.title}
        </h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.steps.map((step, i) => (
            <li
              key={`${step.title}-${i}`}
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
