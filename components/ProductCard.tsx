import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/product";

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-brand-gray bg-brand-white shadow-sm transition hover:border-brand-gold/40 hover:shadow-md">
      <Link
        href={`/products/${product.id}`}
        className="relative aspect-square overflow-hidden bg-brand-gray"
      >
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.imageAlt}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-brand-navy/40">
            بدون صورة
          </div>
        )}
        {product.onSale ? (
          <span className="absolute start-2 top-2 rounded bg-brand-gold px-2 py-0.5 text-xs font-medium text-brand-navy">
            خصم
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/products/${product.id}`}>
          <h2 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-brand-navy hover:text-brand-gold">
            {product.name}
          </h2>
        </Link>

        <p className="min-h-4 text-xs text-brand-navy/60">
          {product.categories[0]?.name ?? ""}
        </p>

        <div className="mt-auto flex flex-wrap items-baseline gap-2">
          <span className="text-base font-bold text-brand-navy">
            {formatCurrency(product.price)}
          </span>
          {product.onSale && product.salePrice != null ? (
            <span className="text-sm text-brand-navy/40 line-through">
              {formatCurrency(product.regularPrice)}
            </span>
          ) : null}
        </div>

        {!product.inStock ? (
          <p className="text-xs text-brand-black/70">غير متوفر</p>
        ) : null}
      </div>
    </article>
  );
}
