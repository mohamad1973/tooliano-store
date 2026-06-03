import "server-only";

import { getDisplayReservedQuantity } from "@/lib/campaign-display-quantity";
import {
  getProgressPercent,
  getRemainingQuantity,
} from "@/lib/campaign-config";

export type CampaignProgressSnapshot = {
  submissionId: string;
  productName: string;
  targetQuantity: number;
  reservedQuantity: number;
  boostReservedQuantity: number;
  displayReserved: number;
  remaining: number;
  percent: number;
};

export function buildCampaignProgress(input: {
  submissionId: string;
  productName: string;
  suggestedQuantity: number;
  reservedQuantity: number;
  boostReservedQuantity: number;
}): CampaignProgressSnapshot {
  const targetQuantity = input.suggestedQuantity;
  const displayReserved = getDisplayReservedQuantity(
    targetQuantity,
    input.reservedQuantity,
    input.boostReservedQuantity,
  );
  const remaining = getRemainingQuantity(targetQuantity, displayReserved);
  const percent = getProgressPercent(targetQuantity, displayReserved);

  return {
    submissionId: input.submissionId,
    productName: input.productName,
    targetQuantity,
    reservedQuantity: input.reservedQuantity,
    boostReservedQuantity: input.boostReservedQuantity,
    displayReserved,
    remaining,
    percent,
  };
}
