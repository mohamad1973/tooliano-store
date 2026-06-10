import {
  campaignStatusBadgeClass,
  campaignStatusLabel,
  type CampaignDisplayStatus,
} from "@/lib/campaign/status";

type Props = {
  status: CampaignDisplayStatus;
  className?: string;
};

export function CampaignStatusBadge({ status, className = "" }: Props) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${campaignStatusBadgeClass(status)} ${className}`}
    >
      {campaignStatusLabel(status)}
    </span>
  );
}
