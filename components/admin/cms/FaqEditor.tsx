"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AdminCmsMessage } from "@/components/admin/cms/AdminCmsMessage";
import type { FaqContent } from "@/lib/cms/types";

export function FaqEditor({
  slug,
  initial,
}: {
  slug: string;
  initial: FaqContent;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [items, setItems] = useState(initial.items);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body = JSON.stringify({ title, items });
      const res = await fetch(`/api/admin/cms/content/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "فشل الحفظ");
        return;
      }
      setMessage("تم الحفظ");
      router.refresh();
    } catch {
      setError("تعذر الاتصال");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mb-10 max-w-2xl border-b border-brand-gray pb-10">
      <h3 className="mb-3 text-lg font-bold text-brand-navy">أسئلة شائعة</h3>
      <AdminCmsMessage message={message} error={error} />
      <label className="mb-4 block text-sm font-medium">
        عنوان القسم
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
      </label>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="rounded-xl border border-brand-gray p-4">
            <label className="mb-2 block text-sm font-medium">
              السؤال
              <input
                value={item.q}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((x, j) =>
                      j === i ? { ...x, q: e.target.value } : x,
                    ),
                  )
                }
                className="mt-1 w-full rounded-lg border px-2 py-1 text-sm"
              />
            </label>
            <label className="block text-sm font-medium">
              الجواب
              <textarea
                value={item.a}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((x, j) =>
                      j === i ? { ...x, a: e.target.value } : x,
                    ),
                  )
                }
                className="mt-1 w-full rounded-lg border px-2 py-1 text-sm"
                rows={3}
              />
            </label>
            <button
              type="button"
              className="mt-2 text-xs text-red-600"
              onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
            >
              حذف السؤال
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-3 text-sm font-semibold text-brand-gold"
        onClick={() =>
          setItems((prev) => [...prev, { q: "سؤال جديد", a: "" }])
        }
      >
        + إضافة سؤال
      </button>
      <button
        type="submit"
        disabled={loading}
        className="mt-6 block rounded-xl bg-brand-gold px-4 py-2 text-sm font-bold text-brand-navy disabled:opacity-60"
      >
        {loading ? "جاري الحفظ…" : "حفظ الأسئلة الشائعة"}
      </button>
    </form>
  );
}
