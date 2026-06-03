"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { WhatsAppCountBadge } from "@/components/notifications/WhatsAppCountBadge";

type NotificationItem = {
  id: string;
  type: string;
  productName: string;
  message: string;
  orderId: string;
  submissionId: string | null;
  remainingQuantity: number | null;
  readAt: string | null;
  createdAt: string;
};

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function itemHref(n: NotificationItem): string {
  if (n.submissionId) return `/campaign/offer/${n.submissionId}`;
  return `/account/orders/${n.orderId}`;
}

const POLL_MS = 15_000;

type Props = {
  /** للهيدر الداكن (تاجر / إدارة) */
  onDark?: boolean;
};

export function CampaignAlertsBell({ onDark = false }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [silent, setSilent] = useState(true);
  const prevUnread = useRef(0);
  const initialized = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const [notifRes, prefRes] = await Promise.all([
        fetch("/api/notifications"),
        fetch("/api/me/notification-preferences"),
      ]);
      if (prefRes.ok) {
        const pref = await prefRes.json();
        setSilent(Boolean(pref.silent));
      }
      if (!notifRes.ok) return;
      const data = await notifRes.json();
      const nextUnread = data.unreadCount ?? 0;
      if (
        initialized.current &&
        !silent &&
        nextUnread > prevUnread.current
      ) {
        try {
          const audio = new Audio("/sounds/notify.mp3");
          audio.volume = 0.4;
          void audio.play();
        } catch {
          /* no sound file */
        }
      }
      prevUnread.current = nextUnread;
      initialized.current = true;
      setItems(data.items ?? []);
      setUnreadCount(nextUnread);
    } catch {
      /* ignore */
    }
  }, [silent]);

  useEffect(() => {
    void load();
    const t = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    void load();
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    void load();
  }

  return (
    <div className="relative" ref={panelRef} dir="rtl">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`relative flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-brand-gold/20 hover:text-brand-gold ${
          onDark
            ? "text-brand-white"
            : "text-brand-navy"
        }`}
        aria-label={`الإشعارات${unreadCount > 0 ? `، ${unreadCount} جديد` : ""}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <WhatsAppCountBadge count={unreadCount} />
      </button>

      {open ? (
        <div className="absolute end-0 top-full z-[110] mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-brand-gray bg-brand-white shadow-xl sm:end-0">
          <div className="flex items-center justify-between border-b border-brand-gray bg-brand-navy px-4 py-3 text-brand-white">
            <span className="font-bold">الإشعارات</span>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-xs text-brand-gold hover:underline"
              >
                تعليم الكل كمقروء
              </button>
            ) : null}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-brand-navy/60">
                لا توجد إشعارات
              </li>
            ) : (
              items.map((n) => {
                const unread = !n.readAt;
                return (
                  <li key={n.id}>
                    <Link
                      href={itemHref(n)}
                      onClick={() => {
                        if (unread) void markRead(n.id);
                        setOpen(false);
                      }}
                      className={`flex gap-3 border-b border-brand-gray/50 px-4 py-3 transition hover:bg-brand-gray/30 ${
                        unread ? "bg-emerald-50" : ""
                      }`}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-brand-gold">
                        {n.productName.charAt(0)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate font-semibold text-brand-navy">
                            {n.productName}
                          </span>
                          <span className="shrink-0 text-[10px] text-brand-navy/50">
                            {formatWhen(n.createdAt)}
                          </span>
                        </span>
                        <span className="mt-0.5 line-clamp-2 text-xs text-brand-navy/70">
                          {n.message}
                        </span>
                        {n.remainingQuantity != null ? (
                          <span className="mt-1 inline-flex rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            متبقي {n.remainingQuantity}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
