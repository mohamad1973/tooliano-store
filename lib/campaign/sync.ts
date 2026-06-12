import "server-only";

export {
  failCampaign,
  succeedCampaign,
  tryEarlyCampaignSuccess,
} from "@/lib/campaign/campaign-outcome";
export { processExpiredCampaigns } from "@/lib/campaign/auto-extend";

import { processExpiredCampaigns } from "@/lib/campaign/auto-extend";

export async function syncCampaigns(): Promise<{
  succeeded: number;
  extended: number;
}> {
  return processExpiredCampaigns({ notify: true });
}

/** @deprecated استخدم التمديد التلقائي — تُبقى للتوافق مع decision.ts */
export async function markCampaignAwaitingDecision(
  submissionId: string,
  options?: { notify?: boolean },
): Promise<void> {
  await processExpiredCampaigns({
    notify: options?.notify !== false,
    submissionId,
  });
}
