export type WCProductImage = {
  id: number;
  src: string;
  alt: string;
};

export type WCProductCategory = {
  id: number;
  name: string;
  slug: string;
};

export type WCProduct = {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: string;
  featured: boolean;
  average_rating: string;
  rating_count: number;
  images: WCProductImage[];
  categories: WCProductCategory[];
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  price: number;
  regularPrice: number;
  salePrice: number | null;
  onSale: boolean;
  inStock: boolean;
  thumbnail: string;
  imageAlt: string;
  categories: WCProductCategory[];
  rating: number;
  ratingCount: number;
};

export type ProductImage = {
  id: number;
  src: string;
  alt: string;
};

/** منتج كامل للاندنج — صور متعددة + أوصاف */
export type ProductDetail = Product & {
  images: ProductImage[];
  shortDescription: string;
  descriptionHtml: string;
  sku: string;
};
