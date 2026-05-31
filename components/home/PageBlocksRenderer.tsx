import Link from "next/link";
import {
  PAGE_BLOCK_TYPES,
  parsePageBlockPayload,
  type CtaBlockPayload,
  type HeroBlockPayload,
  type RichTextBlockPayload,
} from "@/lib/cms/page-blocks";
import { getPageBlocks } from "@/lib/cms/get-site-content";
import { sanitizeRichHtml } from "@/lib/cms/sanitize";

export async function PageBlocksRenderer() {
  const blocks = await getPageBlocks();
  if (blocks.length === 0) return null;

  return (
    <>
      {blocks.map((block) => {
        if (block.type === PAGE_BLOCK_TYPES.HERO) {
          const p = parsePageBlockPayload<HeroBlockPayload>(block.payload, {
            title: "",
            subtitle: "",
            buttonLabel: "",
            buttonHref: "/",
          });
          return (
            <section
              key={block.id}
              className="bg-brand-navy py-12 text-center text-brand-white sm:py-16"
            >
              <div className="mx-auto max-w-3xl px-4">
                <h1 className="text-3xl font-bold text-brand-gold sm:text-4xl">
                  {p.title}
                </h1>
                {p.subtitle ? (
                  <p className="mt-3 text-sm text-brand-white/85 sm:text-base">
                    {p.subtitle}
                  </p>
                ) : null}
                {p.buttonLabel ? (
                  <Link
                    href={p.buttonHref || "/"}
                    className="mt-6 inline-block rounded-xl bg-brand-gold px-8 py-3 text-sm font-bold text-brand-navy transition hover:bg-brand-gold/90"
                  >
                    {p.buttonLabel}
                  </Link>
                ) : null}
              </div>
            </section>
          );
        }

        if (block.type === PAGE_BLOCK_TYPES.RICH_TEXT) {
          const p = parsePageBlockPayload<RichTextBlockPayload>(block.payload, {
            html: "",
          });
          if (!p.html.trim()) return null;
          return (
            <section key={block.id} className="py-10 sm:py-12">
              <div
                className="prose prose-sm mx-auto max-w-3xl px-4 text-brand-navy [&_a]:text-brand-gold"
                dangerouslySetInnerHTML={{
                  __html: sanitizeRichHtml(p.html),
                }}
              />
            </section>
          );
        }

        if (block.type === PAGE_BLOCK_TYPES.CTA) {
          const p = parsePageBlockPayload<CtaBlockPayload>(block.payload, {
            title: "",
            buttonLabel: "",
            buttonHref: "/",
          });
          return (
            <section
              key={block.id}
              className="border-y border-brand-gray bg-brand-gray/30 py-10"
            >
              <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 text-center">
                {p.title ? (
                  <h2 className="text-xl font-bold text-brand-navy">{p.title}</h2>
                ) : null}
                {p.buttonLabel ? (
                  <Link
                    href={p.buttonHref}
                    className="rounded-xl bg-brand-gold px-6 py-2.5 text-sm font-bold text-brand-navy"
                  >
                    {p.buttonLabel}
                  </Link>
                ) : null}
              </div>
            </section>
          );
        }

        return null;
      })}
    </>
  );
}
