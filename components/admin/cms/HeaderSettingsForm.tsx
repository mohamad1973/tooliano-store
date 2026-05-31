"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AdminCmsMessage } from "@/components/admin/cms/AdminCmsMessage";

export function HeaderSettingsForm({
  initial,
}: {
  initial: Record<string, string>;
}) {
  const router = useRouter();
  const [siteName, setSiteName] = useState(initial.siteName ?? "");
  const [tagline, setTagline] = useState(initial.tagline ?? "");
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl ?? "");
  const [marqueeEnabled, setMarqueeEnabled] = useState(
    initial.marqueeEnabled !== "false",
  );
  const [metaDescription, setMetaDescription] = useState(
    initial.metaDescription ?? "",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/cms/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            siteName,
            tagline,
            logoUrl,
            marqueeEnabled: marqueeEnabled ? "true" : "false",
            metaDescription,
          },
        }),
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
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      <AdminCmsMessage message={message} error={error} />
      <label className="block text-sm font-medium text-brand-navy">
        اسم الموقع
        <input
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-brand-gray px-3 py-2"
          required
        />
      </label>
      <label className="block text-sm font-medium text-brand-navy">
        الشعار الفرعي
        <input
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          className="mt-1 w-full rounded-lg border border-brand-gray px-3 py-2"
        />
      </label>
      <label className="block text-sm font-medium text-brand-navy">
        رابط الشعار (اختياري)
        <input
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          className="mt-1 w-full rounded-lg border border-brand-gray px-3 py-2"
          placeholder="/logo.png أو https://..."
          dir="ltr"
        />
      </label>
      <label className="block text-sm font-medium text-brand-navy">
        وصف SEO
        <textarea
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          className="mt-1 w-full rounded-lg border border-brand-gray px-3 py-2"
          rows={2}
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-medium text-brand-navy">
        <input
          type="checkbox"
          checked={marqueeEnabled}
          onChange={(e) => setMarqueeEnabled(e.target.checked)}
        />
        إظهار الشريط المتحرك
      </label>
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-brand-gold px-6 py-2.5 text-sm font-bold text-brand-navy disabled:opacity-60"
      >
        {loading ? "جاري الحفظ…" : "حفظ"}
      </button>
    </form>
  );
}
