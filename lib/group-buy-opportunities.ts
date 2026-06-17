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
import { prepareApprovedSubmissionsForListing } from "@/lib/campaign/prepare-listing";
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
  suggestedRetailPrice: number | null;
  suggestedGroupPrice: number | null;
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

  const results = await Promise.allSettled(
    rows.map(async (row) => {
      const campaignEndsAt =
        row.campaignEndsAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000);
      let productImageUrl: string | null = null;
      try {
        productImageUrl = await resolveSubmissionDisplayImageUrl(
          row.productImageUrl,
          row.wooProductId,
        );
      } catch (err) {
        console.error(
          `[mapSubmissionRows] image ${row.id}:`,
          err,
        );
      }

      return {
        id: row.id,
        productName: row.productName,
        productType: row.productType,
        productCondition: row.productCondition,
        productImageUrl,
        vendorCompanyName:
          row.vendor.vendorProfile?.companyName ?? row.vendor.username,
        targetQuantity: row.suggestedQuantity,
        reservedQuantity: row.reservedQuantity,
        boostReservedQuantity: row.boostReservedQuantity ?? 0,
        campaignEndsAt,
        campaignOutcome: row.campaignOutcome,
        displayStatus: resolveCampaignDisplayStatus(
          row.campaignOutcome,
          campaignEndsAt,
          now,
        ),
        suggestedRetailPrice: row.suggestedRetailPrice,
        suggestedGroupPrice: row.suggestedGroupPrice,
        wooProductId: row.wooProductId,
      } satisfies GroupBuyOpportunity;
    }),
  );

  const mapped = results
    .filter(
      (r): r is PromiseFulfilledResult<GroupBuyOpportunity> =>
        r.status === "fulfilled",
    )
    .map((r) => r.value);

  return mapped.sort((a, b) => {
    const byStatus = compareCampaignDisplayStatus(
      a.displayStatus,
      b.displayStatus,
    );
    if (byStatus !== 0) return byStatus;
    return b.campaignEndsAt.getTime() - a.campaignEndsAt.getTime();
  });
}

/**
 * شروط ظهور بطاقة المنتج في «فرص الشراء الجماعي»:
 * معتمد + غير مخفي إدارياً فقط — بدون فلتر وقت أو publishedOnStore.
 */
function groupBuyListingWhere(
  wooProductIds?: number[],
): Prisma.ProductSubmissionWhereInput {
  return {
    status: APPROVAL_STATUS.APPROVED,
    adminHidden: false,
    ...(wooProductIds?.length
      ? { wooProductId: { in: wooProductIds } }
      : {}),
  };
}

export async function fetchActiveGroupBuyOpportunities(): Promise<
  GroupBuyOpportunity[]
> {
  try {
    await prepareApprovedSubmissionsForListing();
  } catch (err) {
    console.error("[fetchActiveGroupBuyOpportunities] prepare:", err);
  }

  const rows = await prisma.productSubmission.findMany({
    where: groupBuyListingWhere(),
    include: submissionInclude,
    orderBy: { reviewedAt: "desc" },
  });
  return await mapSubmissionRows(rows);
}

/** فرص شراء جماعي لمنتجات تنتمي لتصنيف WooCommerce. */
export async function fetchActiveGroupBuyOpportunitiesForCategory(
  categoryId: number,
): Promise<GroupBuyOpportunity[]> {
  try {
    await prepareApprovedSubmissionsForListing();
  } catch (err) {
    console.error(
      "[fetchActiveGroupBuyOpportunitiesForCategory] prepare:",
      err,
    );
  }

  const productIds = await fetchProductIdsInCategory(categoryId);
  if (productIds.length === 0) return [];

  const rows = await prisma.productSubmission.findMany({
    where: groupBuyListingWhere(productIds),
    include: submissionInclude,
    orderBy: { reviewedAt: "desc" },
  });
  return await mapSubmissionRows(rows);
}
