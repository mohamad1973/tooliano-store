import type { Product, ProductDetail, WCProduct } from "@/types/product";

function parsePrice(value: string): number {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export function mapProduct(raw: WCProduct): Product {
  const price = parsePrice(raw.price);
  const regularPrice = parsePrice(raw.regular_price);
  const salePriceRaw = raw.sale_price.trim();
  const salePrice =
    salePriceRaw.length > 0 ? parsePrice(salePriceRaw) : null;
  const rating = Number.parseFloat(raw.average_rating);
  const thumbnail = raw.images[0]?.src ?? "";
  const imageAlt = raw.images[0]?.alt || raw.name;

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    permalink: raw.permalink,
    price: raw.on_sale && salePrice !== null ? salePrice : price,
    regularPrice,
    salePrice: raw.on_sale ? salePrice : null,
    onSale: raw.on_sale,
    inStock:
      raw.stock_status === "instock" || raw.stock_status === "onbackorder",
    thumbnail,
    imageAlt,
    categories: raw.categories,
    rating: Number.isFinite(rating) ? rating : 0,
    ratingCount: raw.rating_count,
  };
}

export function mapProducts(raw: WCProduct[]): Product[] {
  return raw.map(mapProduct);
}

export function mapProductDetail(raw: WCProduct): ProductDetail {
  const base = mapProduct(raw);
  const images = raw.images.map((img) => ({
    id: img.id,
    src: img.src,
    alt: img.alt || raw.name,
  }));

  return {
    ...base,
    images,
    shortDescription: raw.short_description?.trim() ?? "",
    descriptionHtml: raw.description?.trim() ?? "",
    sku: raw.sku?.trim() ?? "",
  };
}
