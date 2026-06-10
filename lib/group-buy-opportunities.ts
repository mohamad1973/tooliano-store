import "server-only";

import { prisma } from "@/lib/db/prisma";
import { APPROVAL_STATUS } from "@/lib/db/constants";
import {
  compareCampaignDisplayStatus,
  resolveCampaignDisplayStatus,
  type CampaignDisplayStatus,
} from "@/lib/campaign/status";
import { resolveSubmissionDisplayImageUrl } from "@/lib/submission-display-image";
import { fetchProductIdsInCategory } from "@/lib/products";
import type { Prisma } from "@prisma/client";

export type GroupBuyOpportunity = {
  id: string;
  productName: string;
  productType: string;
  productCondition: string;
  productImageUrl: string | null;
  vendorCompanyName: string;
  targetQuantity: number;
  reservedQuantity: number;
  boostReservedQuantity: number;
  campaignEndsAt: Date;
  campaignOutcome: string;
  displayStatus: CampaignDisplayStatus;
  suggestedRetailPrice: number;
  suggestedGroupPrice: number;
  wooProductId: number | null;
};

const submissionInclude = {
  vendor: { include: { vendorProfile: true } },
} satisfies Prisma.ProductSubmissionInclude;

type SubmissionRow = Prisma.ProductSubmissionGetPayload<{
  include: typeof submissionInclude;
}>;

async function mapSubmissionRows(
  rows: SubmissionRow[],
): Promise<GroupBuyOpportunity[]> {
  const now = new Date();
  const filtered = rows.filter(
    (r) =>
      r.suggestedRetailPrice != null &&
      r.suggestedGroupPrice != null &&
      r.campaignEndsAt != null,
  );

  const mapped = await Promise.all(
    filtered.map(async (row) => ({
      id: row.id,
      productName: row.productName,
      productType: row.productType,
      productCondition: row.productCondition,
      productImageUrl: await resolveSubmissionDisplayImageUrl(
        row.productImageUrl,
        row.wooProductId,
      ),
      vendorCompanyName:
        row.vendor.vendorProfile?.companyName ?? row.vendor.username,
      targetQuantity: row.suggestedQuantity,
      reservedQuantity: row.reservedQuantity,
      boostReservedQuantity: row.boostReservedQuantity ?? 0,
      campaignEndsAt: row.campaignEndsAt!,
      campaignOutcome: row.campaignOutcome,
      displayStatus: resolveCampaignDisplayStatus(
        row.campaignOutcome,
        row.campaignEndsAt,
        now,
      ),
      suggestedRetailPrice: row.suggestedRetailPrice!,
      suggestedGroupPrice: row.suggestedGroupPrice!,
      wooProductId: row.wooProductId,
    })),
  );

  return mapped.sort((a, b) => {
    const byStatus = compareCampaignDisplayStatus(
      a.displayStatus,
      b.displayStatus,
    );
    if (byStatus !== 0) return byStatus;
    return b.campaignEndsAt.getTime() - a.campaignEndsAt.getTime();
  });
}

function visibleSubmissionWhere(
  wooProductIds?: number[],
): Prisma.ProductSubmissionWhereInput {
  return {
    status: APPROVAL_STATUS.APPROVED,
    publishedOnStore: true,
    adminHidden: false,
    ...(wooProductIds?.length
      ? { wooProductId: { in: wooProductIds } }
      : {}),
  };
}

export async function fetchActiveGroupBuyOpportunities(): Promise<
  GroupBuyOpportunity[]
> {
  const rows = await prisma.productSubmission.findMany({
    where: visibleSubmissionWhere(),
    include: submissionInclude,
    orderBy: { reviewedAt: "desc" },
  });
  return await mapSubmissionRows(rows);
}

/** فرص شراء جماعي لمنتجات تنتمي لتصنيف WooCommerce. */
export async function fetchActiveGroupBuyOpportunitiesForCategory(
  categoryId: number,
): Promise<GroupBuyOpportunity[]> {
  const productIds = await fetchProductIdsInCategory(categoryId);
  if (productIds.length === 0) return [];

  const rows = await prisma.productSubmission.findMany({
    where: visibleSubmissionWhere(productIds),
    include: submissionInclude,
    orderBy: { reviewedAt: "desc" },
  });
  return await mapSubmissionRows(rows);
}
