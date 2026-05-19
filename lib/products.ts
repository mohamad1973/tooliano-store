import "server-only";

import { mapProduct, mapProducts } from "@/lib/adapters";
import { DEFAULT_PER_PAGE } from "@/lib/constants";
import { createWooClient } from "@/lib/woo-client";
import type { Product, WCProduct } from "@/types/product";

export type ProductListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string | number;
  featured?: boolean;
};

export async function fetchProducts(
  params: ProductListParams = {},
): Promise<{ products: Product[]; total: number }> {
  const woo = createWooClient();
  const response = await woo.get<WCProduct[]>("/products", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? DEFAULT_PER_PAGE,
      status: "publish",
      ...(params.search ? { search: params.search } : {}),
      ...(params.category != null ? { category: params.category } : {}),
      ...(params.featured ? { featured: true } : {}),
    },
  });

  const raw = Array.isArray(response.data) ? response.data : [];
  const products = mapProducts(
    raw.filter(
      (p) =>
        p.stock_status === "instock" || p.stock_status === "onbackorder",
    ),
  );

  const total = Number(response.headers["x-wp-total"] ?? products.length);

  return { products, total };
}

export async function fetchProductById(id: number): Promise<Product | null> {
  const woo = createWooClient();
  try {
    const response = await woo.get<WCProduct>(`/products/${id}`);
    return mapProduct(response.data);
  } catch {
    return null;
  }
}
