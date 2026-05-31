"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminCmsMessage } from "@/components/admin/cms/AdminCmsMessage";

type Item = { id: string; text: string; sortOrder: number; enabled: boolean };

export function MarqueeEditor({ initial }: { initial: Item[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [newText, setNewText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    router.refresh();
    const res = await fetch("/api/admin/cms/marquee");
    const data = await res.json();
    if (res.ok) setItems(data.items);
  }

  async function addItem() {
    setError(null);
    const res = await fetch("/api/admin/cms/marquee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "فشل الإضافة");
      return;
    }
    setNewText("");
    setMessage("تمت الإضافة");
    await refresh();
  }

  async function updateItem(id: string, patch: Partial<Item>) {
    const res = await fetch(`/api/admin/cms/marquee/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      setError("فشل التحديث");
      return;
    }
    setMessage("تم التحديث");
    await refresh();
  }

  async function deleteItem(id: string) {
    if (!confirm("حذف هذا السطر؟")) return;
    await fetch(`/api/admin/cms/marquee/${id}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <div className="max-w-2xl">
      <AdminCmsMessage message={message} error={error} />
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-gray bg-brand-white p-3"
          >
            <input
              value={item.text}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((i) =>
                    i.id === item.id ? { ...i, text: e.target.value } : i,
                  ),
                )
              }
              onBlur={() => updateItem(item.id, { text: item.text })}
              className="min-w-[200px] flex-1 rounded-lg border border-brand-gray px-2 py-1 text-sm"
            />
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={item.enabled}
                onChange={(e) =>
                  updateItem(item.id, { enabled: e.target.checked })
                }
              />
              مفعّل
            </label>
            <button
              type="button"
              onClick={() => deleteItem(item.id)}
              className="text-xs font-semibold text-red-600"
            >
              حذف
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-2">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="عبارة جديدة"
          className="flex-1 rounded-lg border border-brand-gray px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={addItem}
          className="rounded-xl bg-brand-navy px-4 py-2 text-sm font-bold text-brand-white"
        >
          إضافة
        </button>
      </div>
    </div>
  );
}
