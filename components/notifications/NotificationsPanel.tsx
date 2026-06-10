"use client";

import { useCallback, useEffect, useState } from "react";

type NotificationItem = {
  id: string;
  type: string;
  productName: string;
  message: string;
  orderId: string;
  submissionId: string | null;
  readAt: string | null;
  createdAt: string;
};

function notificationHref(
  n: NotificationItem,
  orderLinkPrefix?: string,
): string | null {
  if (
    n.submissionId &&
    (n.orderId.startsWith("campaign:") || n.type.startsWith("CAMPAIGN_"))
  ) {
    return `/campaign/offer/${n.submissionId}`;
  }
  if (orderLinkPrefix) return `${orderLinkPrefix}/${n.orderId}`;
  if (n.submissionId) return `/campaign/offer/${n.submissionId}`;
  return null;
}

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("ar-EG", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function NotificationsPanel({
  orderLinkPrefix,
}: {
  /** مثال: `/account/orders` للمشتري */
  orderLinkPrefix?: string;
}) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "تعذر تحميل الإشعارات");
        return;
      }
      setItems(data.items ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      setError("تعذر الاتصال");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function markRead(ids: string[]) {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    const data = await res.json();
    if (!res.ok) return;
    setUnreadCount(data.unreadCount ?? 0);
    setItems((prev) =>
      prev.map((n) =>
        ids.includes(n.id) ? { ...n, readAt: new Date().toISOString() } : n,
      ),
    );
  }

  async function markAllRead() {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    const data = await res.json();
    if (!res.ok) return;
    setUnreadCount(0);
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? now })));
  }

  if (loading) {
    return <p className="text-sm text-brand-navy/60">جاري تحميل الإشعارات…</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-red-600">
        {error}{" "}
        <button
          type="button"
          onClick={() => void load()}
          className="font-semibold text-brand-gold underline"
        >
          إعادة المحاولة
        </button>
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-brand-navy/70">
          {unreadCount > 0
            ? `${unreadCount} غير مقروء`
            : "لا توجد إشعارات جديدة"}
        </p>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="text-xs font-semibold text-brand-gold hover:underline"
          >
            تعليم الكل كمقروء
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-brand-navy/60">لا توجد إشعارات بعد.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => {
            const unread = !n.readAt;
            const orderHref = notificationHref(n, orderLinkPrefix);

            return (
              <li
                key={n.id}
                className={`rounded-xl border p-4 text-sm ${
                  unread
                    ? "border-brand-gold/50 bg-brand-gold/5"
                    : "border-brand-gray bg-brand-white"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold text-brand-navy">{n.message}</p>
                  {unread ? (
                    <button
                      type="button"
                      onClick={() => void markRead([n.id])}
                      className="shrink-0 text-xs font-semibold text-brand-gold hover:underline"
                    >
                      مقروء
                    </button>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-brand-navy/50">
                  {formatWhen(n.createdAt)}
                </p>
                {orderHref ? (
                  <a
                    href={orderHref}
                    className="mt-2 inline-block text-xs font-semibold text-brand-gold hover:underline"
                  >
                    {n.orderId.startsWith("campaign:") || n.type.startsWith("CAMPAIGN_")
                      ? "عرض العرض ←"
                      : "عرض الطلب ←"}
                  </a>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
