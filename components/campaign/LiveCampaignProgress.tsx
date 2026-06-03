"use client";

import { useCallback, useEffect, useState } from "react";
import { QuantityProgress } from "@/components/landing/QuantityProgress";
import { RemainingCountBadge } from "@/components/notifications/RemainingCountBadge";

type ProgressData = {
  targetQuantity: number;
  reservedQuantity: number;
  boostReservedQuantity: number;
  remaining: number;
};

type Props = {
  submissionId: string;
  initial: ProgressData;
  showCircleBadge?: boolean;
  compact?: boolean;
};

const POLL_MS = 15_000;

export function LiveCampaignProgress({
  submissionId,
  initial,
  showCircleBadge = false,
  compact = false,
}: Props) {
  const [data, setData] = useState(initial);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/campaigns/${submissionId}/progress`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = (await res.json()) as ProgressData & {
        boostReservedQuantity: number;
      };
      setData({
        targetQuantity: json.targetQuantity,
        reservedQuantity: json.reservedQuantity,
        boostReservedQuantity: json.boostReservedQuantity ?? 0,
        remaining: json.remaining,
      });
    } catch {
      /* ignore */
    }
  }, [submissionId]);

  useEffect(() => {
    setData(initial);
  }, [initial]);

  useEffect(() => {
    const t = window.setInterval(() => void refresh(), POLL_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refresh]);

  return (
    <div className="relative">
      {showCircleBadge ? (
        <div className="mb-2 flex justify-center">
          <RemainingCountBadge remaining={data.remaining} size="sm" />
        </div>
      ) : null}
      <QuantityProgress
        targetQuantity={data.targetQuantity}
        reservedQuantity={data.reservedQuantity}
        boostReservedQuantity={data.boostReservedQuantity}
        compact={compact}
      />
    </div>
  );
}
