"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  submissionId?: string;
  endsAt: string;
  compact?: boolean;
  /** عند انتهاء العداد: تمديد العرض من API بدون إعادة تحميل الصفحة */
  refreshOnExpiry?: boolean;
};

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

function calcRemaining(endsAt: string): Remaining {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, expired: false };
}

function Unit({
  value,
  label,
  compact,
}: {
  value: number;
  label: string;
  compact: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "flex min-w-[2.5rem] flex-col items-center rounded-lg border border-brand-gray bg-brand-white px-1.5 py-1.5"
          : "flex min-w-[3.5rem] flex-col items-center rounded-xl border border-brand-gray bg-brand-white px-2 py-2 sm:min-w-[4.5rem] sm:px-3 sm:py-3"
      }
    >
      <span
        className={
          compact
            ? "text-base font-bold tabular-nums text-brand-navy"
            : "text-xl font-bold tabular-nums text-brand-navy sm:text-2xl"
        }
      >
        {String(value).padStart(2, "0")}
      </span>
      <span
        className={
          compact
            ? "mt-0.5 text-[9px] font-medium text-brand-navy/60"
            : "mt-0.5 text-[10px] font-medium text-brand-navy/60 sm:text-xs"
        }
      >
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({
  submissionId,
  endsAt,
  compact = false,
  refreshOnExpiry = true,
}: Props) {
  const extending = useRef(false);
  const [currentEndsAt, setCurrentEndsAt] = useState(endsAt);
  const [remaining, setRemaining] = useState<Remaining>(() =>
    calcRemaining(endsAt),
  );

  useEffect(() => {
    extending.current = false;
    setCurrentEndsAt(endsAt);
    setRemaining(calcRemaining(endsAt));
  }, [endsAt]);

  const extendCampaign = useCallback(async () => {
    if (!submissionId || extending.current) return;
    extending.current = true;
    try {
      const res = await fetch(`/api/campaigns/${submissionId}/progress`, {
        cache: "no-store",
      });
      if (!res.ok) {
        extending.current = false;
        return;
      }
      const json = (await res.json()) as { campaignEndsAt?: string };
      if (json.campaignEndsAt) {
        setCurrentEndsAt(json.campaignEndsAt);
        setRemaining(calcRemaining(json.campaignEndsAt));
        extending.current = calcRemaining(json.campaignEndsAt).expired;
      } else {
        extending.current = false;
      }
    } catch {
      /* سيُعاد المحاولة مع النبضة التالية */
      extending.current = false;
    }
  }, [submissionId]);

  useEffect(() => {
    function maybeRefresh(next: Remaining) {
      if (
        refreshOnExpiry &&
        next.expired &&
        submissionId
      ) {
        void extendCampaign();
      }
    }

    maybeRefresh(calcRemaining(currentEndsAt));

    const id = setInterval(() => {
      const next = calcRemaining(currentEndsAt);
      setRemaining(next);
      maybeRefresh(next);
    }, 1000);
    return () => clearInterval(id);
  }, [currentEndsAt, extendCampaign, refreshOnExpiry, submissionId]);

  if (remaining.expired) {
    return (
      <p
        className={
          compact
            ? "text-center text-xs font-semibold text-brand-navy/70"
            : "text-center text-sm font-semibold text-brand-navy/70"
        }
      >
        جاري تمديد العرض…
      </p>
    );
  }

  return (
    <div
      className={
        compact
          ? "flex flex-wrap justify-center gap-1.5"
          : "flex flex-wrap justify-center gap-2 sm:gap-3"
      }
      dir="ltr"
      aria-live="polite"
      aria-label="الوقت المتبقي للعرض"
    >
      <Unit value={remaining.days} label="يوم" compact={compact} />
      <Unit value={remaining.hours} label="ساعة" compact={compact} />
      <Unit value={remaining.minutes} label="دقيقة" compact={compact} />
      <Unit value={remaining.seconds} label="ثانية" compact={compact} />
    </div>
  );
}
