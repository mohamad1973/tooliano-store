import { NextResponse } from "next/server";
import {
  repairApprovedStoreVisibility,
  repairMissingCampaignEndsAt,
} from "@/lib/campaign/ensure-visibility";
import { processExpiredCampaigns } from "@/lib/campaign/auto-extend";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const published = await repairApprovedStoreVisibility();
  const campaignEndsAt = await repairMissingCampaignEndsAt();
  const expired = await processExpiredCampaigns({ notify: false });

  return NextResponse.json({
    ok: true,
    published,
    campaignEndsAt,
    ...expired,
  });
}
