import "server-only";

import { prisma } from "@/lib/db/prisma";
import { APPROVAL_STATUS } from "@/lib/db/constants";
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
  campaignEndsAt: Date;
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
  const filtered = rows.filter(
    (r) =>
      r.suggestedRetailPrice != null && r.suggestedGroupPrice != null,
  );

  return Promise.all(
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
      campaignEndsAt: row.campaignEndsAt!,
      suggestedRetailPrice: row.suggestedRetailPrice!,
      suggestedGroupPrice: row.suggestedGroupPrice!,
      wooProductId: row.wooProductId,
    })),
  );
}

function activeSubmissionWhere(
  wooProductIds?: number[],
): Prisma.ProductSubmissionWhereInput {
  const now = new Date();
  return {
    status: APPROVAL_STATUS.APPROVED,
    publishedOnStore: true,
    campaignEndsAt: { gt: now },
    ...(wooProductIds?.length
      ? { wooProductId: { in: wooProductIds } }
      : {}),
  };
}

export async function fetchActiveGroupBuyOpportunities(): Promise<
  GroupBuyOpportunity[]
> {
  const rows = await prisma.productSubmission.findMany({
    where: activeSubmissionWhere(),
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
    where: activeSubmissionWhere(productIds),
    include: submissionInclude,
    orderBy: { reviewedAt: "desc" },
  });
  return await mapSubmissionRows(rows);
}
