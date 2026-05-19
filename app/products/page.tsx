import { ProductCard } from "@/components/ProductCard";
import { SiteHeader } from "@/components/SiteHeader";
import { DEFAULT_PER_PAGE, SITE_NAME } from "@/lib/constants";
import { fetchProducts } from "@/lib/products";

export const metadata = {
  title: `المنتجات | ${SITE_NAME}`,
  description: "تصفح منتجات أدوات المنزل من Tooliano",
};

export default async function ProductsPage() {
  let products: Awaited<ReturnType<typeof fetchProducts>>["products"] = [];
  let error: string | null = null;

  try {
    const result = await fetchProducts({ per_page: DEFAULT_PER_PAGE });
    products = result.products;
  } catch (e) {
    error = e instanceof Error ? e.message : "تعذّر تحميل المنتجات";
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">المنتجات</h1>
          <p className="mt-1 text-sm text-zinc-600">
            بيانات حية من متجر WooCommerce على tooliano.com
          </p>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {!error && products.length === 0 ? (
          <p className="text-zinc-600">لا توجد منتجات منشورة حالياً.</p>
        ) : null}

        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
