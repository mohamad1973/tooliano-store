"use client";

import { useEffect, useState } from "react";
import {
  getProgressPercent,
  getRemainingQuantity,
} from "@/lib/campaign-config";

type Props = {
  endsAt: string;
  targetQuantity: number;
  reservedQuantity: number;
};

function calcRemaining(endsAt: string) {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return { expired: true, label: "انتهى العرض" };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  if (days > 0) return { expired: false, label: `${days}ي ${hours}س` };
  return { expired: false, label: `${hours}س ${minutes}د` };
}

export function CompactCampaignStats({
  endsAt,
  targetQuantity,
  reservedQuantity,
}: Props) {
  const [timeLabel, setTimeLabel] = useState(() => calcRemaining(endsAt).label);
  const remaining = getRemainingQuantity(targetQuantity, reservedQuantity);
  const percent = getProgressPercent(targetQuantity, reservedQuantity);

  useEffect(() => {
    const tick = () => setTimeLabel(calcRemaining(endsAt).label);
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [endsAt]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between gap-2 text-[11px] text-brand-navy/70">
        <span>
          ⏱ <span className="font-semibold tabular-nums text-brand-navy">{timeLabel}</span>
        </span>
        <span>
          متبقي{" "}
          <span className="font-bold tabular-nums text-brand-gold">{remaining}</span> قطعة
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-brand-gray">
        <div
          className="h-full rounded-full bg-brand-gold transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-center text-[10px] text-brand-navy/50">
        {reservedQuantity}/{targetQuantity} محجوز ({percent}%)
      </p>
    </div>
  );
}
