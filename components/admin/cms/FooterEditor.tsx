"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AdminCmsMessage } from "@/components/admin/cms/AdminCmsMessage";

type Link = {
  id?: string;
  label: string;
  href: string;
  sortOrder: number;
  external: boolean;
};

type Column = {
  id?: string;
  title: string;
  sortOrder: number;
  links: Link[];
};

export function FooterEditor({ initial }: { initial: Column[] }) {
  const router = useRouter();
  const [columns, setColumns] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/cms/footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          columns: columns.map((col, ci) => ({
            title: col.title,
            sortOrder: ci,
            links: col.links.map((l, li) => ({
              label: l.label,
              href: l.href,
              sortOrder: li,
              external: l.external,
            })),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "فشل الحفظ");
        return;
      }
      setMessage("تم حفظ الفوتر");
      router.refresh();
    } catch {
      setError("تعذر الاتصال");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <AdminCmsMessage message={message} error={error} />
      {columns.map((col, ci) => (
        <fieldset
          key={ci}
          className="rounded-xl border border-brand-gray bg-brand-white p-4"
        >
          <label className="block text-sm font-bold text-brand-navy">
            عنوان العمود
            <input
              value={col.title}
              onChange={(e) =>
                setColumns((prev) =>
                  prev.map((c, i) =>
                    i === ci ? { ...c, title: e.target.value } : c,
                  ),
                )
              }
              className="mt-1 w-full rounded-lg border px-2 py-1"
            />
          </label>
          <ul className="mt-3 space-y-2">
            {col.links.map((link, li) => (
              <li key={li} className="grid gap-2 sm:grid-cols-3">
                <input
                  value={link.label}
                  onChange={(e) =>
                    setColumns((prev) =>
                      prev.map((c, i) =>
                        i === ci
                          ? {
                              ...c,
                              links: c.links.map((l, j) =>
                                j === li ? { ...l, label: e.target.value } : l,
                              ),
                            }
                          : c,
                      ),
                    )
                  }
                  placeholder="التسمية"
                  className="rounded-lg border px-2 py-1 text-sm"
                />
                <input
                  value={link.href}
                  onChange={(e) =>
                    setColumns((prev) =>
                      prev.map((c, i) =>
                        i === ci
                          ? {
                              ...c,
                              links: c.links.map((l, j) =>
                                j === li ? { ...l, href: e.target.value } : l,
                              ),
                            }
                          : c,
                      ),
                    )
                  }
                  placeholder="الرابط"
                  className="rounded-lg border px-2 py-1 text-sm"
                  dir="ltr"
                />
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={link.external}
                    onChange={(e) =>
                      setColumns((prev) =>
                        prev.map((c, i) =>
                          i === ci
                            ? {
                                ...c,
                                links: c.links.map((l, j) =>
                                  j === li
                                    ? { ...l, external: e.target.checked }
                                    : l,
                                ),
                              }
                            : c,
                        ),
                      )
                    }
                  />
                  خارجي
                </label>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-2 text-xs font-semibold text-brand-gold"
            onClick={() =>
              setColumns((prev) =>
                prev.map((c, i) =>
                  i === ci
                    ? {
                        ...c,
                        links: [
                          ...c.links,
                          {
                            label: "رابط جديد",
                            href: "/",
                            sortOrder: c.links.length,
                            external: false,
                          },
                        ],
                      }
                    : c,
                ),
              )
            }
          >
            + رابط
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        className="text-sm font-semibold text-brand-navy"
        onClick={() =>
          setColumns((prev) => [
            ...prev,
            {
              title: "عمود جديد",
              sortOrder: prev.length,
              links: [{ label: "رابط", href: "/", sortOrder: 0, external: false }],
            },
          ])
        }
      >
        + عمود
      </button>
      <button
        type="submit"
        disabled={loading}
        className="block rounded-xl bg-brand-gold px-6 py-2.5 text-sm font-bold text-brand-navy disabled:opacity-60"
      >
        {loading ? "جاري الحفظ…" : "حفظ الفوتر"}
      </button>
    </form>
  );
}
