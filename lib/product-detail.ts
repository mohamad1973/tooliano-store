import "server-only";

import { mapProductDetail } from "@/lib/adapters";
import { createWooClient } from "@/lib/woo-client";
import type { ProductDetail, WCProduct } from "@/types/product";

export async function fetchProductDetailById(
  id: number,
): Promise<ProductDetail | null> {
  const woo = createWooClient();
  try {
    const response = await woo.get<WCProduct>(`/products/${id}`);
    return mapProductDetail(response.data);
  } catch {
    return null;
  }
}
