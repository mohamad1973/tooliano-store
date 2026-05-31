"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminCmsMessage } from "@/components/admin/cms/AdminCmsMessage";
import { SortableList } from "@/components/admin/cms/SortableList";

type Section = {
  id: string;
  key: string;
  label: string;
  sortOrder: number;
  visible: boolean;
};

export function HomeSectionsDndEditor({ initial }: { initial: Section[] }) {
  const router = useRouter();
  const [sections, setSections] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function persistReorder(orderedIds: string[]) {
    const res = await fetch("/api/admin/cms/sections/reorder", {
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
      <p className="mb-4 text-sm text-brand-navy/70">
        اسحب الأقسام لإعادة ترتيب الصفحة الرئيسية.
      </p>
      <SortableList
        items={sections}
        onReorder={persistReorder}
        renderItem={(section) => (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-bold text-brand-navy">{section.label}</p>
              <p className="text-xs text-brand-navy/50">{section.key}</p>
            </div>
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={section.visible}
                onChange={() => toggleVisible(section)}
              />
              ظاهر في الموقع
            </label>
          </div>
        )}
      />
    </div>
  );
}
