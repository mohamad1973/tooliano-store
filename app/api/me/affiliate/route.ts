import { NextResponse } from "next/server";
import {
  isSessionResponse,
  requireApiBuyer,
} from "@/lib/auth/api-session";
import { getAffiliateSummaryForBuyer } from "@/lib/affiliate/stats";

export async function GET() {
  const session = await requireApiBuyer();
  if (isSessionResponse(session)) return session;

  const summary = await getAffiliateSummaryForBuyer(session.userId);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://tooliano-store.vercel.app";

  return NextResponse.json({
    referralCode: summary.referralCode,
    shareUrl: `${siteUrl}/?ref=${summary.referralCode}`,
    totalEarned: summary.totalEarned,
    totalReversed: summary.totalReversed,
    netEarned: summary.netEarned,
    referredOrdersCount: summary.referredOrdersCount,
  });
}
