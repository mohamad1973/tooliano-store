"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminCmsMessage } from "@/components/admin/cms/AdminCmsMessage";

type Item = {
  id: string;
  imageUrl: string;
  categorySlug: string | null;
  title: string | null;
  sortOrder: number;
  enabled: boolean;
};

export function BannersEditor({ initial }: { initial: Item[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newBanner, setNewBanner] = useState({
    imageUrl: "/banners/tools.jpg",
    categorySlug: "",
    title: "",
  });

  async function refresh() {
    router.refresh();
    const res = await fetch("/api/admin/cms/banners");
    const data = await res.json();
    if (res.ok) setItems(data.items);
  }

  async function saveItem(item: Item) {
    const res = await fetch(`/api/admin/cms/banners/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl: item.imageUrl,
        categorySlug: item.categorySlug || null,
        title: item.title || null,
        enabled: item.enabled,
      }),
    });
    if (!res.ok) setError("فشل الحفظ");
    else {
      setMessage("تم الحفظ");
      await refresh();
    }
  }

  async function addBanner() {
    const res = await fetch("/api/admin/cms/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBanner),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "فشل الإضافة");
      return;
    }
    setMessage("تمت الإضافة");
    await refresh();
  }

  async function deleteBanner(id: string) {
    if (!confirm("حذف البنر؟")) return;
    await fetch(`/api/admin/cms/banners/${id}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <div className="space-y-4">
      <AdminCmsMessage message={message} error={error} />
      {items.map((item) => (
        <div
          key={item.id}
          className="grid gap-3 rounded-xl border border-brand-gray bg-brand-white p-4 sm:grid-cols-2"
        >
          <label className="text-sm">
            رابط الصورة
            <input
              value={item.imageUrl}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((i) =>
                    i.id === item.id ? { ...i, imageUrl: e.target.value } : i,
                  ),
                )
              }
              className="mt-1 w-full rounded-lg border px-2 py-1 text-sm"
              dir="ltr"
            />
          </label>
          <label className="text-sm">
            slug التصنيف (WooCommerce)
            <input
              value={item.categorySlug ?? ""}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((i) =>
                    i.id === item.id
                      ? { ...i, categorySlug: e.target.value || null }
                      : i,
                  ),
                )
              }
              className="mt-1 w-full rounded-lg border px-2 py-1 text-sm"
              dir="ltr"
            />
          </label>
          <label className="text-sm">
            عنوان مخصص (اختياري)
            <input
              value={item.title ?? ""}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((i) =>
                    i.id === item.id
                      ? { ...i, title: e.target.value || null }
                      : i,
                  ),
                )
              }
              className="mt-1 w-full rounded-lg border px-2 py-1 text-sm"
            />
          </label>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={item.enabled}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((i) =>
                      i.id === item.id ? { ...i, enabled: e.target.checked } : i,
                    ),
                  )
                }
              />
              مفعّل
            </label>
            <button
              type="button"
              onClick={() => saveItem(item)}
              className="rounded-lg bg-brand-gold px-3 py-1 text-xs font-bold text-brand-navy"
            >
              حفظ
            </button>
            <button
              type="button"
              onClick={() => deleteBanner(item.id)}
              className="text-xs text-red-600"
            >
              حذف
            </button>
          </div>
        </div>
      ))}
      <div className="rounded-xl border border-dashed border-brand-gold p-4">
        <p className="mb-2 text-sm font-bold text-brand-navy">بنر جديد</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            value={newBanner.imageUrl}
            onChange={(e) =>
              setNewBanner((b) => ({ ...b, imageUrl: e.target.value }))
            }
            placeholder="رابط الصورة"
            className="rounded-lg border px-2 py-1 text-sm"
            dir="ltr"
          />
          <input
            value={newBanner.categorySlug}
            onChange={(e) =>
              setNewBanner((b) => ({ ...b, categorySlug: e.target.value }))
            }
            placeholder="slug التصنيف"
            className="rounded-lg border px-2 py-1 text-sm"
            dir="ltr"
          />
          <button
            type="button"
            onClick={addBanner}
            className="rounded-lg bg-brand-navy py-1 text-sm font-bold text-brand-white"
          >
            إضافة بنر
          </button>
        </div>
      </div>
    </div>
  );
}
