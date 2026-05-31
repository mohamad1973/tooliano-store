"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminCmsMessage } from "@/components/admin/cms/AdminCmsMessage";
import { SortableList } from "@/components/admin/cms/SortableList";

type Item = {
  id: string;
  label: string;
  href: string;
  linkType: string;
  categorySlug: string | null;
  enabled: boolean;
};

export function NavMenuEditor({ initial }: { initial: Item[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    label: "",
    href: "/products",
    linkType: "internal",
  });

  async function persistReorder(orderedIds: string[]) {
    const res = await fetch("/api/admin/cms/menu/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    });
    if (!res.ok) {
      setError("فشل حفظ الترتيب");
      return;
    }
    setMessage("تم حفظ الترتيب");
    router.refresh();
    const list = await fetch("/api/admin/cms/menu");
    const data = await list.json();
    if (list.ok) setItems(data.items);
  }

  async function updateItem(item: Item) {
    const res = await fetch(`/api/admin/cms/menu/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: item.label,
        href: item.href,
        linkType: item.linkType,
        categorySlug: item.categorySlug,
        enabled: item.enabled,
      }),
    });
    if (!res.ok) setError("فشل التحديث");
    else {
      setMessage("تم الحفظ");
      router.refresh();
    }
  }

  async function addItem() {
    const res = await fetch("/api/admin/cms/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "فشل الإضافة");
      return;
    }
    setNewItem({ label: "", href: "/products", linkType: "internal" });
    setMessage("تمت الإضافة");
    router.refresh();
    const list = await fetch("/api/admin/cms/menu");
    const json = await list.json();
    if (list.ok) setItems(json.items);
  }

  async function deleteItem(id: string) {
    if (!confirm("حذف هذا العنصر؟")) return;
    await fetch(`/api/admin/cms/menu/${id}`, { method: "DELETE" });
    router.refresh();
    const list = await fetch("/api/admin/cms/menu");
    const json = await list.json();
    if (list.ok) setItems(json.items);
  }

  return (
    <div className="max-w-2xl">
      <AdminCmsMessage message={message} error={error} />
      <p className="mb-4 text-sm text-brand-navy/70">
        اسحب العناصر لإعادة الترتيب. هذه القائمة تظهر في الهيدر بدلاً من تصنيفات
        WooCommerce التلقائية.
      </p>

      <SortableList
        items={items}
        onReorder={persistReorder}
        renderItem={(item) => (
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={item.label}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((i) =>
                    i.id === item.id ? { ...i, label: e.target.value } : i,
                  ),
                )
              }
              className="rounded-lg border px-2 py-1 text-sm"
              placeholder="الاسم"
            />
            <input
              value={item.href}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((i) =>
                    i.id === item.id ? { ...i, href: e.target.value } : i,
                  ),
                )
              }
              className="rounded-lg border px-2 py-1 text-sm"
              placeholder="الرابط"
              dir="ltr"
            />
            <select
              value={item.linkType}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((i) =>
                    i.id === item.id ? { ...i, linkType: e.target.value } : i,
                  ),
                )
              }
              className="rounded-lg border px-2 py-1 text-sm"
            >
              <option value="internal">داخلي</option>
              <option value="external">خارجي</option>
              <option value="category">تصنيف</option>
            </select>
            {item.linkType === "category" ? (
              <input
                value={item.categorySlug ?? ""}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((i) =>
                      i.id === item.id
                        ? {
                            ...i,
                            categorySlug: e.target.value || null,
                            href: e.target.value
                              ? `/products?category=${encodeURIComponent(e.target.value)}`
                              : i.href,
                          }
                        : i,
                    ),
                  )
                }
                className="rounded-lg border px-2 py-1 text-sm sm:col-span-2"
                placeholder="slug التصنيف (مثل tools)"
                dir="ltr"
              />
            ) : null}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((i) =>
                        i.id === item.id
                          ? { ...i, enabled: e.target.checked }
                          : i,
                      ),
                    )
                  }
                />
                مفعّل
              </label>
              <button
                type="button"
                onClick={() => updateItem(item)}
                className="rounded bg-brand-gold px-2 py-1 text-xs font-bold text-brand-navy"
              >
                حفظ
              </button>
              <button
                type="button"
                onClick={() => deleteItem(item.id)}
                className="text-xs text-red-600"
              >
                حذف
              </button>
            </div>
          </div>
        )}
      />

      <div className="mt-6 rounded-xl border border-dashed border-brand-gold p-4">
        <p className="mb-2 text-sm font-bold text-brand-navy">عنصر جديد</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            value={newItem.label}
            onChange={(e) =>
              setNewItem((n) => ({ ...n, label: e.target.value }))
            }
            placeholder="اسم القسم"
            className="rounded-lg border px-2 py-1 text-sm"
          />
          <input
            value={newItem.href}
            onChange={(e) => setNewItem((n) => ({ ...n, href: e.target.value }))}
            placeholder="/products?category=slug"
            className="rounded-lg border px-2 py-1 text-sm"
            dir="ltr"
          />
          <button
            type="button"
            onClick={addItem}
            className="rounded-lg bg-brand-navy py-1 text-sm font-bold text-brand-white"
          >
            إضافة
          </button>
        </div>
      </div>
    </div>
  );
}
