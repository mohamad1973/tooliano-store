import "server-only";

import { prisma } from "@/lib/db/prisma";
import { APPROVAL_STATUS } from "@/lib/db/constants";
import { normalizeProductImageSrc } from "@/lib/product-image-src";

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

export async function fetchActiveGroupBuyOpportunities(): Promise<
  GroupBuyOpportunity[]
> {
  const now = new Date();

  const rows = await prisma.productSubmission.findMany({
    where: {
      status: APPROVAL_STATUS.APPROVED,
      publishedOnStore: true,
      campaignEndsAt: { gt: now },
    },
    include: {
      vendor: {
        include: { vendorProfile: true },
      },
    },
    orderBy: { reviewedAt: "desc" },
  });

  return rows
    .filter(
      (r) =>
        r.suggestedRetailPrice != null && r.suggestedGroupPrice != null,
    )
    .map((row) => ({
      id: row.id,
      productName: row.productName,
      productType: row.productType,
      productCondition: row.productCondition,
      productImageUrl: normalizeProductImageSrc(row.productImageUrl),
      vendorCompanyName:
        row.vendor.vendorProfile?.companyName ?? row.vendor.username,
      targetQuantity: row.suggestedQuantity,
      reservedQuantity: row.reservedQuantity,
      campaignEndsAt: row.campaignEndsAt!,
      suggestedRetailPrice: row.suggestedRetailPrice!,
      suggestedGroupPrice: row.suggestedGroupPrice!,
      wooProductId: row.wooProductId,
    }));
}
