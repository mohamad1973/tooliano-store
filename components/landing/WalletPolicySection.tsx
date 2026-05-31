import type { WalletPolicyContent } from "@/lib/cms/types";

export function WalletPolicySection({ content }: { content: WalletPolicyContent }) {
  return (
    <section
      className="border-y border-brand-gray bg-brand-navy py-12 text-brand-white sm:py-16"
      id="wallet"
    >
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">
          {content.title}
        </h2>
        <div
          className="prose prose-invert prose-sm mx-auto mt-3 max-w-2xl text-center text-brand-white/80 sm:text-base [&_a]:text-brand-gold"
          dangerouslySetInnerHTML={{ __html: content.intro }}
        />
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {content.options.map((o) => (
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
