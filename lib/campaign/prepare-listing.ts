import "server-only";

import {
  repairApprovedStoreVisibility,
  repairMissingCampaignEndsAt,
} from "@/lib/campaign/ensure-visibility";
import { processExpiredCampaigns } from "@/lib/campaign/auto-extend";

/** إعداد المنتجات المعتمدة قبل عرضها في «فرص الشراء الجماعي» */
export async function prepareApprovedSubmissionsForListing(
  submissionId?: string,
): Promise<void> {
  await repairApprovedStoreVisibility(submissionId);
  await repairMissingCampaignEndsAt(submissionId);
  await processExpiredCampaigns({ notify: false, submissionId });
}
