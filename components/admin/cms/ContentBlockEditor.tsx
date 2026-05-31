"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AdminCmsMessage } from "@/components/admin/cms/AdminCmsMessage";

export function ContentBlockEditor({
  slug,
  label,
  initialTitle,
  initialBody,
}: {
  slug: string;
  label: string;
  initialTitle: string;
  initialBody: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      JSON.parse(body);
    } catch {
      setError("JSON غير صالح");
      setLoading(false);
      return;
    }
    try {
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
    <form onSubmit={onSubmit} className="mb-10 max-w-3xl border-b border-brand-gray pb-10">
      <h3 className="mb-3 text-lg font-bold text-brand-navy">{label}</h3>
      <AdminCmsMessage message={message} error={error} />
      <label className="mb-3 block text-sm font-medium">
        عنوان القسم
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
      </label>
      <label className="mb-3 block text-sm font-medium">
        المحتوى (JSON)
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 font-mono text-xs"
          rows={12}
          dir="ltr"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-brand-gold px-4 py-2 text-sm font-bold text-brand-navy disabled:opacity-60"
      >
        {loading ? "جاري الحفظ…" : "حفظ"}
      </button>
    </form>
  );
}
