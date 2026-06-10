import { CAMPAIGN_OUTCOME } from "@/lib/db/constants";

export type CampaignDisplayStatus =
  | "ACTIVE"
  | "AWAITING_DECISION"
  | "SUCCEEDED"
  | "FAILED";

const DISPLAY_SORT_ORDER: Record<CampaignDisplayStatus, number> = {
  ACTIVE: 0,
  AWAITING_DECISION: 1,
  SUCCEEDED: 2,
  FAILED: 3,
};

export function isCampaignExpired(
  campaignEndsAt: Date | string | null,
  now = new Date(),
): boolean {
  if (!campaignEndsAt) return false;
  const ends =
    campaignEndsAt instanceof Date
      ? campaignEndsAt
      : new Date(campaignEndsAt);
  return ends.getTime() <= now.getTime();
}

export function resolveCampaignDisplayStatus(
  campaignOutcome: string,
  campaignEndsAt: Date | string | null,
  now = new Date(),
): CampaignDisplayStatus {
  if (campaignOutcome === CAMPAIGN_OUTCOME.SUCCEEDED) return "SUCCEEDED";
  if (campaignOutcome === CAMPAIGN_OUTCOME.FAILED) return "FAILED";
  if (
    campaignOutcome === CAMPAIGN_OUTCOME.AWAITING_DECISION ||
    (campaignOutcome === CAMPAIGN_OUTCOME.ACTIVE &&
      isCampaignExpired(campaignEndsAt, now))
  ) {
    return "AWAITING_DECISION";
  }
  return "ACTIVE";
}

export function isAwaitingCampaignDecision(
  campaignOutcome: string,
  campaignEndsAt: Date | string | null,
  now = new Date(),
): boolean {
  return resolveCampaignDisplayStatus(campaignOutcome, campaignEndsAt, now) ===
    "AWAITING_DECISION";
}

export function canReserveCampaign(input: {
  campaignOutcome: string;
  campaignEndsAt: Date | string | null;
  adminHidden?: boolean;
  now?: Date;
}): boolean {
  if (input.adminHidden) return false;
  if (input.campaignOutcome !== CAMPAIGN_OUTCOME.ACTIVE) return false;
  if (isCampaignExpired(input.campaignEndsAt, input.now)) return false;
  return true;
}

export function canApplyCampaignDecision(
  campaignOutcome: string,
  campaignEndsAt: Date | string | null,
  now = new Date(),
): boolean {
  if (
    campaignOutcome !== CAMPAIGN_OUTCOME.ACTIVE &&
    campaignOutcome !== CAMPAIGN_OUTCOME.AWAITING_DECISION
  ) {
    return false;
  }
  return isCampaignExpired(campaignEndsAt, now);
}

export function compareCampaignDisplayStatus(
  a: CampaignDisplayStatus,
  b: CampaignDisplayStatus,
): number {
  return DISPLAY_SORT_ORDER[a] - DISPLAY_SORT_ORDER[b];
}

export function campaignStatusLabel(status: CampaignDisplayStatus): string {
  switch (status) {
    case "ACTIVE":
      return "العرض نشط";
    case "AWAITING_DECISION":
      return "انتهت المدة — في انتظار تمديد البائع";
    case "SUCCEEDED":
      return "تم تنفيذ الصفقة";
    case "FAILED":
      return "أُنهيت الصفقة دون تنفيذ";
  }
}

export function campaignStatusBadgeClass(status: CampaignDisplayStatus): string {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-600 text-white";
    case "AWAITING_DECISION":
      return "bg-amber-600 text-white";
    case "SUCCEEDED":
      return "bg-brand-navy text-white";
    case "FAILED":
      return "bg-red-700 text-white";
  }
}
