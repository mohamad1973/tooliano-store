"use client";

import { useEffect, useState } from "react";

export function NotificationPreferencesForm() {
  const [enabled, setEnabled] = useState(true);
  const [silent, setSilent] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/me/notification-preferences");
      if (res.ok) {
        const data = await res.json();
        setEnabled(Boolean(data.enabled));
        setSilent(Boolean(data.silent));
      }
      setLoading(false);
    })();
  }, []);

  async function save(patch: { enabled?: boolean; silent?: boolean }) {
    setSaved(false);
    const res = await fetch("/api/me/notification-preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const data = await res.json();
      setEnabled(data.enabled);
      setSilent(data.silent);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    }
  }

  if (loading) {
    return <p className="text-sm text-brand-navy/60">جاري التحميل…</p>;
  }

  return (
    <div className="space-y-4 rounded-2xl border border-brand-gray bg-brand-white p-5">
      <h2 className="text-lg font-bold text-brand-navy">إعدادات الإشعارات</h2>
      <label className="flex cursor-pointer items-center justify-between gap-3">
        <span className="text-sm text-brand-navy">إشعارات الحملة (حجز مشتري آخر)</span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => void save({ enabled: e.target.checked })}
          className="h-5 w-5 accent-emerald-600"
        />
      </label>
      <label className="flex cursor-pointer items-center justify-between gap-3">
        <span className="text-sm text-brand-navy">صامت (بدون صوت)</span>
        <input
          type="checkbox"
          checked={silent}
          onChange={(e) => void save({ silent: e.target.checked })}
          className="h-5 w-5 accent-emerald-600"
        />
      </label>
      {saved ? (
        <p className="text-xs text-emerald-700">تم الحفظ</p>
      ) : null}
    </div>
  );
}
