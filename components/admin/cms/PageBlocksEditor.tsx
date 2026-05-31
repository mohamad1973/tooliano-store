"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminCmsMessage } from "@/components/admin/cms/AdminCmsMessage";
import { RichTextEditor } from "@/components/admin/cms/RichTextEditor";
import { SortableList } from "@/components/admin/cms/SortableList";
import {
  DEFAULT_HERO_BLOCK,
  PAGE_BLOCK_TYPES,
  parsePageBlockPayload,
  type CtaBlockPayload,
  type HeroBlockPayload,
  type RichTextBlockPayload,
} from "@/lib/cms/page-blocks";

type Block = {
  id: string;
  type: string;
  payload: string;
  enabled: boolean;
};

const TYPE_LABELS: Record<string, string> = {
  [PAGE_BLOCK_TYPES.HERO]: "بانر رئيسي",
  [PAGE_BLOCK_TYPES.RICH_TEXT]: "نص غني",
  [PAGE_BLOCK_TYPES.CTA]: "زر دعوة",
};

export function PageBlocksEditor({ initial }: { initial: Block[] }) {
  const router = useRouter();
  const [blocks, setBlocks] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    router.refresh();
    const res = await fetch("/api/admin/cms/page-blocks?pageKey=home");
    const data = await res.json();
    if (res.ok) setBlocks(data.items);
  }

  async function persistReorder(orderedIds: string[]) {
    const res = await fetch("/api/admin/cms/page-blocks/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    });
    if (!res.ok) setError("فشل الترتيب");
    else {
      setMessage("تم حفظ الترتيب");
      await refresh();
    }
  }

  async function saveBlock(block: Block) {
    const payload = JSON.parse(block.payload);
    const res = await fetch(`/api/admin/cms/page-blocks/${block.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: block.type,
        payload,
        enabled: block.enabled,
      }),
    });
    if (!res.ok) setError("فشل الحفظ");
    else {
      setMessage("تم الحفظ");
      router.refresh();
    }
  }

  async function addBlock(type: string) {
    let payload: object = {};
    if (type === PAGE_BLOCK_TYPES.HERO) payload = DEFAULT_HERO_BLOCK;
    if (type === PAGE_BLOCK_TYPES.RICH_TEXT) payload = { html: "<p>نص جديد</p>" };
    if (type === PAGE_BLOCK_TYPES.CTA)
      payload = {
        title: "عنوان",
        buttonLabel: "اضغط هنا",
        buttonHref: "/products",
      } as CtaBlockPayload;

    await fetch("/api/admin/cms/page-blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, payload }),
    });
    setMessage("تمت الإضافة");
    await refresh();
  }

  async function deleteBlock(id: string) {
    if (!confirm("حذف الكتلة؟")) return;
    await fetch(`/api/admin/cms/page-blocks/${id}`, { method: "DELETE" });
    await refresh();
  }

  function updatePayload(id: string, payload: object) {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, payload: JSON.stringify(payload) } : b,
      ),
    );
  }

  return (
    <div className="max-w-3xl">
      <AdminCmsMessage message={message} error={error} />
      <p className="mb-4 text-sm text-brand-navy/70">
        اسحب الكتل لترتيب الصفحة الرئيسية. تظهر فوق الأقسام التقليدية (بنرات، شراء
        جماعي).
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(TYPE_LABELS).map(([type, label]) => (
          <button
            key={type}
            type="button"
            onClick={() => addBlock(type)}
            className="rounded-lg bg-brand-navy px-3 py-1.5 text-xs font-bold text-brand-white"
          >
            + {label}
          </button>
        ))}
      </div>

      <SortableList
        items={blocks}
        onReorder={persistReorder}
        renderItem={(block) => {
          const hero = parsePageBlockPayload<HeroBlockPayload>(
            block.payload,
            DEFAULT_HERO_BLOCK,
          );
          const rich = parsePageBlockPayload<RichTextBlockPayload>(block.payload, {
            html: "",
          });
          const cta = parsePageBlockPayload<CtaBlockPayload>(block.payload, {
            title: "",
            buttonLabel: "",
            buttonHref: "/",
          });

          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-brand-navy">
                  {TYPE_LABELS[block.type] ?? block.type}
                </span>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={block.enabled}
                      onChange={(e) =>
                        setBlocks((prev) =>
                          prev.map((b) =>
                            b.id === block.id
                              ? { ...b, enabled: e.target.checked }
                              : b,
                          ),
                        )
                      }
                    />
                    مفعّل
                  </label>
                  <button
                    type="button"
                    onClick={() => saveBlock(block)}
                    className="text-xs font-bold text-brand-gold"
                  >
                    حفظ
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteBlock(block.id)}
                    className="text-xs text-red-600"
                  >
                    حذف
                  </button>
                </div>
              </div>

              {block.type === PAGE_BLOCK_TYPES.HERO ? (
                <div className="grid gap-2">
                  <input
                    value={hero.title}
                    onChange={(e) =>
                      updatePayload(block.id, { ...hero, title: e.target.value })
                    }
                    className="rounded border px-2 py-1 text-sm"
                    placeholder="العنوان"
                  />
                  <input
                    value={hero.subtitle}
                    onChange={(e) =>
                      updatePayload(block.id, {
                        ...hero,
                        subtitle: e.target.value,
                      })
                    }
                    className="rounded border px-2 py-1 text-sm"
                    placeholder="الوصف"
                  />
                  <input
                    value={hero.buttonLabel}
                    onChange={(e) =>
                      updatePayload(block.id, {
                        ...hero,
                        buttonLabel: e.target.value,
                      })
                    }
                    className="rounded border px-2 py-1 text-sm"
                    placeholder="نص الزر"
                  />
                  <input
                    value={hero.buttonHref}
                    onChange={(e) =>
                      updatePayload(block.id, {
                        ...hero,
                        buttonHref: e.target.value,
                      })
                    }
                    className="rounded border px-2 py-1 text-sm"
                    dir="ltr"
                    placeholder="رابط الزر"
                  />
                </div>
              ) : null}

              {block.type === PAGE_BLOCK_TYPES.RICH_TEXT ? (
                <RichTextEditor
                  content={rich.html}
                  onChange={(html) => updatePayload(block.id, { html })}
                />
              ) : null}

              {block.type === PAGE_BLOCK_TYPES.CTA ? (
                <div className="grid gap-2">
                  <input
                    value={cta.title}
                    onChange={(e) =>
                      updatePayload(block.id, { ...cta, title: e.target.value })
                    }
                    className="rounded border px-2 py-1 text-sm"
                  />
                  <input
                    value={cta.buttonLabel}
                    onChange={(e) =>
                      updatePayload(block.id, {
                        ...cta,
                        buttonLabel: e.target.value,
                      })
                    }
                    className="rounded border px-2 py-1 text-sm"
                  />
                  <input
                    value={cta.buttonHref}
                    onChange={(e) =>
                      updatePayload(block.id, {
                        ...cta,
                        buttonHref: e.target.value,
                      })
                    }
                    className="rounded border px-2 py-1 text-sm"
                    dir="ltr"
                  />
                </div>
              ) : null}
            </div>
          );
        }}
      />
    </div>
  );
}
