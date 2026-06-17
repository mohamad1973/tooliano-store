import "server-only";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { APPROVAL_STATUS } from "@/lib/db/constants";
import {
  canReserveCampaign,
  resolveCampaignDisplayStatus,
  type CampaignDisplayStatus,
} from "@/lib/campaign/status";
import { resolveSubmissionDisplayImageUrl } from "@/lib/submission-display-image";
import { prepareApprovedSubmissionsForListing } from "@/lib/campaign/prepare-listing";
import type { ProductImage } from "@/types/product";

export type SubmissionCampaignView = {
  id: string;
  productName: string;
  productType: string;
  productCondition: string;
  productDescription: string;
  specWatts: string | null;
  specVoltage: string | null;
  specCapacity: string | null;
  specPower: string | null;
  specColor: string | null;
  specExtra: string | null;
  outletReason: string | null;
  productImageUrl: string | null;
  images: ProductImage[];
  vendorCompanyName: string;
  targetQuantity: number;
  reservedQuantity: number;
  boostReservedQuantity: number;
  campaignEndsAt: string;
  campaignOutcome: string;
  displayStatus: CampaignDisplayStatus;
  canReserve: boolean;
  retailPrice: number;
  groupPrice: number;
  wooProductId: number | null;
};

export async function fetchSubmissionCampaignById(
  id: string,
): Promise<SubmissionCampaignView | null> {
  await prepareApprovedSubmissionsForListing(id);

  const row = await prisma.productSubmission.findUnique({
    where: { id },
    include: {
      vendor: { include: { vendorProfile: true } },
    },
  });

  if (!row || row.status !== APPROVAL_STATUS.APPROVED) return null;
  if (row.adminHidden) return null;
  if (!row.campaignEndsAt) return null;
  if (row.suggestedRetailPrice == null || row.suggestedGroupPrice == null) {
    return null;
  }

  const displayStatus = resolveCampaignDisplayStatus(
    row.campaignOutcome,
    row.campaignEndsAt,
  );

  const imageSrc = await resolveSubmissionDisplayImageUrl(
    row.productImageUrl,
    row.wooProductId,
  );
  const images: ProductImage[] = imageSrc
    ? [{ id: 0, src: imageSrc, alt: row.productName }]
    : [];

  return {
    id: row.id,
    productName: row.productName,
    productType: row.productType,
    productCondition: row.productCondition,
    productDescription: row.productDescription,
    specWatts: row.specWatts,
    specVoltage: row.specVoltage,
    specCapacity: row.specCapacity,
    specPower: row.specPower,
    specColor: row.specColor,
    specExtra: row.specExtra,
    outletReason: row.outletReason,
    productImageUrl: row.productImageUrl,
    images,
    vendorCompanyName:
      row.vendor.vendorProfile?.companyName ?? row.vendor.username,
    targetQuantity: row.suggestedQuantity,
    reservedQuantity: row.reservedQuantity,
    boostReservedQuantity: row.boostReservedQuantity ?? 0,
    campaignEndsAt: row.campaignEndsAt.toISOString(),
    campaignOutcome: row.campaignOutcome,
    displayStatus,
    canReserve: canReserveCampaign({
      campaignOutcome: row.campaignOutcome,
      campaignEndsAt: row.campaignEndsAt,
      adminHidden: row.adminHidden,
    }),
    retailPrice: row.suggestedRetailPrice,
    groupPrice: row.suggestedGroupPrice,
    wooProductId: row.wooProductId,
  };
}

export async function fetchSubmissionCampaignByWooProductId(
  wooProductId: number,
): Promise<SubmissionCampaignView | null> {
  const row = await prisma.productSubmission.findFirst({
    where: {
      wooProductId,
      status: APPROVAL_STATUS.APPROVED,
      adminHidden: false,
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });
  if (!row) return null;
  return fetchSubmissionCampaignById(row.id);
}

export async function requireSubmissionCampaign(
  id: string,
): Promise<SubmissionCampaignView> {
  const campaign = await fetchSubmissionCampaignById(id);
  if (!campaign) notFound();
  return campaign;
}
