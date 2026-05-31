import "server-only";

import type { ProductSubmission } from "@prisma/client";
import { syncSubmissionImageFromWooProduct } from "@/lib/submission-image-persist";
import { buildWooProductPayload } from "@/lib/woo-product-payload";
import { createWooClient } from "@/lib/woo-client";
import type { WCProduct } from "@/types/product";

export type UpdateWooProductResult = {
  wooProductId: number;
  permalink: string;
};

export async function updateWooProductFromSubmission(
  submission: ProductSubmission,
): Promise<UpdateWooProductResult> {
  if (!submission.wooProductId) {
    throw new Error("المنتج غير منشور على WordPress بعد");
  }

  const woo = createWooClient();
  const payload = await buildWooProductPayload(submission);

  const response = await woo.put<WCProduct>(
    `/products/${submission.wooProductId}`,
    payload,
  );
  const product = response.data;

  await syncSubmissionImageFromWooProduct(submission.id, product.id);

  return {
    wooProductId: product.id,
    permalink: product.permalink,
  };
}
