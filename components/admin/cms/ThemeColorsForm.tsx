"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AdminCmsMessage } from "@/components/admin/cms/AdminCmsMessage";
import { DEFAULT_THEME_COLORS } from "@/lib/cms/defaults";

const FIELDS: { key: keyof typeof DEFAULT_THEME_COLORS; label: string }[] = [
  { key: "colorBrandNavy", label: "أزرق داكن (Navy)" },
  { key: "colorBrandGold", label: "ذهبي" },
  { key: "colorBrandGray", label: "رمادي" },
  { key: "colorBrandWhite", label: "أبيض" },
  { key: "colorBackground", label: "خلفية الصفحة" },
  { key: "colorForeground", label: "لون النص" },
];

export function ThemeColorsForm({
  initial,
}: {
  initial: Record<string, string>;
}) {
  const router = useRouter();
  const [colors, setColors] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/cms/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: colors }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "فشل الحفظ");
        return;
      }
      setMessage("تم حفظ الألوان — حدّث الصفحة لمعاينة التغيير");
      router.refresh();
    } catch {
      setError("تعذر الاتصال");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4">
      <AdminCmsMessage message={message} error={error} />
      {FIELDS.map(({ key, label }) => (
        <label
          key={key}
          className="flex items-center justify-between gap-4 text-sm font-medium text-brand-navy"
        >
          <span>{label}</span>
          <input
            type="color"
            value={colors[key] ?? DEFAULT_THEME_COLORS[key]}
            onChange={(e) =>
              setColors((c) => ({ ...c, [key]: e.target.value }))
            }
            className="h-10 w-20 cursor-pointer rounded border border-brand-gray"
          />
        </label>
      ))}
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-brand-gold px-6 py-2.5 text-sm font-bold text-brand-navy disabled:opacity-60"
      >
        {loading ? "جاري الحفظ…" : "حفظ الألوان"}
      </button>
    </form>
  );
}
