"use client";

import { useCallback, useEffect, useState } from "react";
import { RemainingCountBadge } from "@/components/notifications/RemainingCountBadge";

type Props = {
  submissionId: string;
  initialRemaining: number;
  className?: string;
  size?: "sm" | "md";
};

const POLL_MS = 15_000;

export function LiveRemainingBadge({
  submissionId,
  initialRemaining,
  className = "",
  size = "sm",
}: Props) {
  const [remaining, setRemaining] = useState(initialRemaining);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/campaigns/${submissionId}/progress`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = (await res.json()) as { remaining: number };
      setRemaining(json.remaining);
    } catch {
      /* ignore */
    }
  }, [submissionId]);

  useEffect(() => {
    setRemaining(initialRemaining);
  }, [initialRemaining]);

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
    <RemainingCountBadge
      remaining={remaining}
      size={size}
      className={className}
    />
  );
}
