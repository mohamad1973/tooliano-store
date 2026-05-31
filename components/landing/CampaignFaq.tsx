"use client";

import { useState } from "react";
import type { FaqContent } from "@/lib/cms/types";

export function CampaignFaq({ content }: { content: FaqContent }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-12 sm:py-16" id="faq">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-center text-2xl font-bold text-brand-navy sm:text-3xl">
          {content.title}
        </h2>
        <ul className="mt-8 flex flex-col gap-2">
          {content.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <li
                key={`${item.q}-${i}`}
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
