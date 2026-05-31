import type { Metadata } from "next";
import { GroupBuyOpportunitiesForCategory } from "@/components/group-buy/GroupBuyOpportunitiesForCategory";
import { ProductCard } from "@/components/ProductCard";
import { SiteHeader } from "@/components/SiteHeader";
import Link from "next/link";
import { fetchCategoryBySlug } from "@/lib/categories";
import { DEFAULT_PER_PAGE, SITE_NAME } from "@/lib/constants";
import { fetchProducts } from "@/lib/products";

type Props = {
  searchParams?: Promise<{ category?: string | string[] }>;
};

function firstSlug(
  raw: string | string[] | undefined,
): string | undefined {
  if (typeof raw === "string") return raw.trim() || undefined;
  if (Array.isArray(raw)) {
    const s = raw[0]?.trim();
    return s || undefined;
  }
  return undefined;
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const sp = (await searchParams) ?? {};
  const slug = firstSlug(sp.category);
  if (!slug) {
    return {
      title: `المنتجات | ${SITE_NAME}`,
      description: "تصفح منتجات أدوات المنزل من Tooliano",
    };
  }
  const cat = await fetchCategoryBySlug(slug);
  if (cat) {
    return {
      title: `${cat.name} | ${SITE_NAME}`,
      description: `منتجات قسم ${cat.name} — ${SITE_NAME}`,
    };
  }
  return {
    title: `المنتجات | ${SITE_NAME}`,
    description: "تصفح منتجات أدوات المنزل من Tooliano",
  };
}

export default async function ProductsPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const slug = firstSlug(sp.category);

  let categoryId: number | undefined;
  let categoryLabel: string | null = null;
  let invalidCategory = false;

  if (slug) {
    const cat = await fetchCategoryBySlug(slug);
    if (cat) {
      categoryId = cat.id;
      categoryLabel = cat.name;
    } else {
      invalidCategory = true;
    }
  }

  let products: Awaited<ReturnType<typeof fetchProducts>>["products"] = [];
  let error: string | null = null;

  try {
    const result = await fetchProducts({
      per_page: DEFAULT_PER_PAGE,
      ...(categoryId != null ? { category: categoryId } : {}),
    });
    products = result.products;
  } catch (e) {
    error = e instanceof Error ? e.message : "تعذّر تحميل المنتجات";
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-navy">
            {categoryLabel ? categoryLabel : "المنتجات"}
          </h1>
          <p className="mt-1 text-sm text-brand-navy/70">
            {categoryLabel
              ? `منتجات التصنيف «${categoryLabel}» من WooCommerce`
              : "بيانات حية من متجر WooCommerce على tooliano.com"}
          </p>
        </div>

        {invalidCategory ? (
          <div className="mb-6 rounded-lg border border-brand-gold/50 bg-brand-gold/10 p-4 text-sm text-brand-navy">
            التصنيف «{slug}» غير موجود في WooCommerce — يتم عرض جميع المنتجات.{" "}
            <Link href="/products" className="font-semibold text-brand-gold underline">
              عرض الكل
            </Link>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-brand-navy/20 bg-brand-gray p-4 text-sm text-brand-black">
            {error}
          </div>
        ) : null}

        {!error && products.length === 0 ? (
          <p className="text-brand-navy/70">
            {categoryLabel
              ? "لا توجد منتجات في هذا التصنيف."
              : "لا توجد منتجات منشورة حالياً."}
          </p>
        ) : null}

        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>

        {categoryId != null && categoryLabel ? (
          <GroupBuyOpportunitiesForCategory
            categoryId={categoryId}
            categoryName={categoryLabel}
          />
        ) : null}
      </main>
    </>
  );
}
