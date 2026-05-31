import "server-only";

import type { ProductSubmission } from "@prisma/client";
import {
  buildWooProductDescriptionHtml,
  buildWooShortDescription,
} from "@/lib/build-product-description-html";
import { resolveWooProductImageSrc } from "@/lib/woo-product-image";
import { createWooClient } from "@/lib/woo-client";
import type { WCProduct } from "@/types/product";

export type CreateWooProductResult = {
  wooProductId: number;
  permalink: string;
};

export async function createWooProductFromSubmission(
  submission: ProductSubmission,
): Promise<CreateWooProductResult> {
  const woo = createWooClient();

  const retail = submission.suggestedRetailPrice ?? 0;
  const group = submission.suggestedGroupPrice ?? retail;

  const imageSrc = await resolveWooProductImageSrc(submission.productImageUrl);

  const payload: Record<string, unknown> = {
    name: submission.productName,
    type: "simple",
    status: "publish",
    catalog_visibility: "visible",
    description: buildWooProductDescriptionHtml(submission),
    short_description: buildWooShortDescription(submission),
    regular_price: String(retail),
    manage_stock: false,
    stock_status: "instock",
    categories: [{ name: submission.productType }],
    images: imageSrc
      ? [{ src: imageSrc, alt: submission.productName }]
      : [],
    meta_data: [
      { key: "_tooliano_submission_id", value: submission.id },
      { key: "_tooliano_group_buy", value: "yes" },
      { key: "_tooliano_product_condition", value: submission.productCondition },
    ],
  };

  if (group > 0 && group < retail) {
    payload.sale_price = String(group);
  }

  const response = await woo.post<WCProduct>("/products", payload);
  const product = response.data;

  return {
    wooProductId: product.id,
    permalink: product.permalink,
  };
}
