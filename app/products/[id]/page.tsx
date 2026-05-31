import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { formatCurrency } from "@/lib/format";
import { fetchProductById } from "@/lib/products";
import { SITE_NAME } from "@/lib/constants";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const product = await fetchProductById(Number(id));
  if (!product) return { title: "منتج غير موجود" };
  return {
    title: product.name,
    description: `${product.name} — ${SITE_NAME}`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const productId = Number.parseInt(id, 10);
  if (!Number.isFinite(productId)) notFound();

  const product = await fetchProductById(productId);
  if (!product) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Link
          href="/products"
          className="mb-6 inline-block text-sm text-brand-gold hover:text-brand-navy hover:underline"
        >
          ← العودة للمنتجات
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-brand-gray">
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-brand-navy/40">
                بدون صورة
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-brand-navy">{product.name}</h1>

            {product.categories[0] ? (
              <p className="text-sm text-brand-navy/60">
                {product.categories[0].name}
              </p>
            ) : null}

            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-2xl font-bold text-brand-gold">
                {formatCurrency(product.price)}
              </span>
              {product.onSale ? (
                <span className="text-lg text-brand-navy/40 line-through">
                  {formatCurrency(product.regularPrice)}
                </span>
              ) : null}
            </div>

            <p className="text-sm text-brand-navy/70">
              {product.inStock ? "متوفر في المخزون" : "غير متوفر حالياً"}
            </p>

            {product.ratingCount > 0 ? (
              <p className="text-sm text-brand-navy/60">
                التقييم: {product.rating.toFixed(1)} ({product.ratingCount})
              </p>
            ) : null}
          </div>
        </div>
      </main>
    </>
  );
}
