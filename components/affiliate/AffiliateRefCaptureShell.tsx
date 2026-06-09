"use client";

import { Suspense } from "react";
import { AffiliateRefCapture } from "@/components/affiliate/AffiliateRefCapture";

export function AffiliateRefCaptureShell() {
  return (
    <Suspense fallback={null}>
      <AffiliateRefCapture />
    </Suspense>
  );
}
