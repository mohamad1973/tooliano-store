"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SyncResult = {
  categoriesCount?: number;
  bannersUpdated?: number;
  menuUpdated?: number;
  menuCreated?: number;
  menuDisabled?: number;
  menuRepaired?: number;
};

export function WooCategorySyncButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(
    method: "POST" | "PATCH",
    successLabel: (data: SyncResult) => string,
  ) {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/cms/sync-woo-categories", {
        method,
      });
      const data = (await res.json()) as SyncResult & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "فشلت العملية");
        return;
      }
      setMessage(successLabel(data));
      router.refresh();
    } catch {
      setError("تعذّر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  function repairLinks() {
    run("PATCH", (data) =>
      `تم إصلاح ${data.menuRepaired ?? 0} رابط منيو (مثل /product-category/tools → /products?category=tools).`,
    );
  }

  function sync() {
    run("POST", (data) =>
      `تمت المزامنة: ${data.categoriesCount ?? 0} تصنيف، ${data.bannersUpdated ?? 0} بنر، ${data.menuUpdated ?? 0} منيو محدّث، ${data.menuCreated ?? 0} جديد، ${data.menuRepaired ?? 0} رابط مُصلَح.`,
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-brand-gold/40 bg-brand-gold/10 p-4">
      <p className="text-sm font-bold text-brand-navy">
        مزامنة التصنيفات من WooCommerce
      </p>
      <p className="mt-1 text-xs text-brand-navy/70">
        بعد تغيير الـ slug في ووردبريس، اضغط «إصلاح روابط المنيو» إذا ما زال القسم
        يفتح 404، أو «مزامنة كاملة» لتحديث كل التصنيفات.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={repairLinks}
          disabled={loading}
          className="rounded-lg border border-brand-navy px-4 py-2 text-sm font-bold text-brand-navy disabled:opacity-60"
        >
          {loading ? "جاري…" : "إصلاح روابط المنيو فقط"}
        </button>
        <button
          type="button"
          onClick={sync}
          disabled={loading}
          className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-bold text-brand-white disabled:opacity-60"
        >
          {loading ? "جاري المزامنة…" : "مزامنة كاملة من Woo"}
        </button>
      </div>
      {message ? (
        <p className="mt-2 text-xs text-green-800">{message}</p>
      ) : null}
      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
