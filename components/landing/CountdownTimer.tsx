"use client";

import { useEffect, useState } from "react";

type Props = {
  endsAt: string;
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

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-[3.5rem] flex-col items-center rounded-xl border border-brand-gray bg-brand-white px-2 py-2 sm:min-w-[4.5rem] sm:px-3 sm:py-3">
      <span className="text-xl font-bold tabular-nums text-brand-navy sm:text-2xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-0.5 text-[10px] font-medium text-brand-navy/60 sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({ endsAt }: Props) {
  const [remaining, setRemaining] = useState<Remaining>(() =>
    calcRemaining(endsAt),
  );

  useEffect(() => {
    const id = setInterval(() => setRemaining(calcRemaining(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (remaining.expired) {
    return (
      <p className="text-center text-sm font-semibold text-brand-navy/70">
        انتهت فترة العرض
      </p>
    );
  }

  return (
    <div
      className="flex flex-wrap justify-center gap-2 sm:gap-3"
      dir="ltr"
      aria-live="polite"
      aria-label="الوقت المتبقي للعرض"
    >
      <Unit value={remaining.days} label="يوم" />
      <Unit value={remaining.hours} label="ساعة" />
      <Unit value={remaining.minutes} label="دقيقة" />
      <Unit value={remaining.seconds} label="ثانية" />
    </div>
  );
}
