"use client";

import { useCallback, useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";

type AffiliateData = {
  referralCode: string;
  shareUrl: string;
  totalEarned: number;
  totalReversed: number;
  netEarned: number;
  referredOrdersCount: number;
};

export function AffiliateSharePanel() {
  const [data, setData] = useState<AffiliateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  useEffect(() => {
    void fetch("/api/me/affiliate")
      .then(async (res) => {
        if (!res.ok) throw new Error("فشل التحميل");
        return res.json() as Promise<AffiliateData>;
      })
      .then(setData)
      .catch(() => setError("تعذّر تحميل بيانات الإحالة"));
  }, []);

  const copy = useCallback(async (text: string, kind: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setError("تعذّر النسخ");
    }
  }, []);

  const share = useCallback(async () => {
    if (!data) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Tooliano — ادعُ أصدقاءك",
          text: `استخدم كود الإحالة ${data.referralCode} عند الشراء`,
          url: data.shareUrl,
        });
        return;
      } catch {
        /* cancelled */
      }
    }
    await copy(data.shareUrl, "link");
  }, [copy, data]);

  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  if (!data) {
    return (
      <p className="text-sm text-brand-navy/60">جاري تحميل برنامج الإحالة…</p>
    );
  }

  return (
    <section
      className="rounded-2xl border border-brand-gray bg-brand-white p-5 shadow-sm"
      dir="rtl"
    >
      <h2 className="text-lg font-bold text-brand-navy">برنامج الإحالة</h2>
      <p className="mt-1 text-sm text-brand-navy/70">
        شارك كودك أو رابطك — عند حجز صديق لمنتج فيه عمولة، تُضاف لمحفظتك
        وتُخصم تلقائياً إذا فشلت الصفقة.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-xs font-semibold text-brand-navy/60">كود الإحالة</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <code className="rounded-lg bg-brand-gray/40 px-3 py-2 text-lg font-bold tracking-widest text-brand-navy">
              {data.referralCode}
            </code>
            <button
              type="button"
              onClick={() => void copy(data.referralCode, "code")}
              className="rounded-lg border border-brand-gray px-3 py-2 text-sm font-semibold hover:bg-brand-gray/40"
            >
              {copied === "code" ? "تم النسخ ✓" : "نسخ الكود"}
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-brand-navy/60">رابط المشاركة</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <input
              readOnly
              value={data.shareUrl}
              dir="ltr"
              className="min-w-0 flex-1 rounded-lg border border-brand-gray px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => void copy(data.shareUrl, "link")}
              className="rounded-lg border border-brand-gray px-3 py-2 text-sm font-semibold hover:bg-brand-gray/40"
            >
              {copied === "link" ? "تم النسخ ✓" : "نسخ الرابط"}
            </button>
            <button
              type="button"
              onClick={() => void share()}
              className="rounded-lg bg-brand-gold px-3 py-2 text-sm font-bold text-brand-navy"
            >
              مشاركة
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-brand-gray/30 px-3 py-2">
          <p className="text-xs text-brand-navy/60">عمولات مكتسبة</p>
          <p className="font-bold text-green-800">
            {formatCurrency(data.totalEarned)}
          </p>
        </div>
        <div className="rounded-xl bg-brand-gray/30 px-3 py-2">
          <p className="text-xs text-brand-navy/60">خصومات (فشل صفقة)</p>
          <p className="font-bold text-red-700">
            {formatCurrency(data.totalReversed)}
          </p>
        </div>
        <div className="rounded-xl bg-brand-gray/30 px-3 py-2">
          <p className="text-xs text-brand-navy/60">صافي العمولات</p>
          <p className="font-bold text-brand-gold">
            {formatCurrency(data.netEarned)}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-brand-navy/50">
        عدد الطلبات المُحالة: {data.referredOrdersCount} — التفاصيل في{" "}
        <a href="/account/wallet" className="text-brand-gold underline">
          كشف المحفظة
        </a>
      </p>
    </section>
  );
}
