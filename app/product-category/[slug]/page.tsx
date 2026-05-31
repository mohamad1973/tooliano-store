import { redirect } from "next/navigation";
import { categoryProductsHref } from "@/lib/category-banners";

type Props = { params: Promise<{ slug: string }> };

/** توافق مع روابط WooCommerce: /product-category/{slug} */
export default async function ProductCategoryRedirectPage({ params }: Props) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug).trim();
  if (!decoded) redirect("/products");
  redirect(categoryProductsHref(decoded));
}
