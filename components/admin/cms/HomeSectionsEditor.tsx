"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminCmsMessage } from "@/components/admin/cms/AdminCmsMessage";

type Section = {
  id: string;
  key: string;
  label: string;
  sortOrder: number;
  visible: boolean;
};

export function HomeSectionsEditor({ initial }: { initial: Section[] }) {
  const router = useRouter();
  const [sections, setSections] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reorder(id: string, direction: "up" | "down") {
    const res = await fetch("/api/admin/cms/sections/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, direction }),
    });
    if (!res.ok) {
      setError("فشل إعادة الترتيب");
      return;
    }
    setMessage("تم تحديث الترتيب");
    router.refresh();
    const list = await fetch("/api/admin/cms/sections");
    const data = await list.json();
    if (list.ok) setSections(data.items);
  }

  async function toggleVisible(section: Section) {
    const res = await fetch(`/api/admin/cms/sections/${section.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !section.visible }),
    });
    if (!res.ok) {
      setError("فشل التحديث");
      return;
    }
    setSections((prev) =>
      prev.map((s) =>
        s.id === section.id ? { ...s, visible: !s.visible } : s,
      ),
    );
    setMessage("تم التحديث");
    router.refresh();
  }

  return (
    <div className="max-w-xl">
      <AdminCmsMessage message={message} error={error} />
      <ul className="space-y-2">
        {sections.map((section, index) => (
          <li
            key={section.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-gray bg-brand-white px-4 py-3"
          >
            <div>
              <p className="font-bold text-brand-navy">{section.label}</p>
              <p className="text-xs text-brand-navy/50">{section.key}</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={section.visible}
                  onChange={() => toggleVisible(section)}
                />
                ظاهر
              </label>
              <button
                type="button"
                disabled={index === 0}
                onClick={() => reorder(section.id, "up")}
                className="rounded border px-2 py-0.5 text-xs disabled:opacity-40"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={index === sections.length - 1}
                onClick={() => reorder(section.id, "down")}
                className="rounded border px-2 py-0.5 text-xs disabled:opacity-40"
              >
                ↓
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
