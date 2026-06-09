"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function AffiliateRefCapture() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    if (!ref?.trim()) return;

    void fetch("/api/affiliate/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref: ref.trim() }),
    }).catch(() => {
      /* ignore */
    });
  }, [ref]);

  return null;
}
