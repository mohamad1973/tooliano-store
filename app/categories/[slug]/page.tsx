import { redirect } from "next/navigation";
import { categoryProductsHref } from "@/lib/category-banners";

type Props = { params: Promise<{ slug: string }> };

/** مسار بديل شائع لأقسام المتجر */
export default async function CategoriesRedirectPage({ params }: Props) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug).trim();
  if (!decoded) redirect("/products");
  redirect(categoryProductsHref(decoded));
}
