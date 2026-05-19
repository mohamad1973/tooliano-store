import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/product";

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">
      <Link
        href={`/products/${product.id}`}
        className="relative aspect-square overflow-hidden bg-zinc-100"
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
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">
            بدون صورة
          </div>
        )}
        {product.onSale ? (
          <span className="absolute start-2 top-2 rounded bg-orange-600 px-2 py-0.5 text-xs font-medium text-white">
            خصم
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/products/${product.id}`}>
          <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 hover:text-orange-700">
            {product.name}
          </h2>
        </Link>

        {product.categories[0] ? (
          <p className="text-xs text-zinc-500">{product.categories[0].name}</p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-baseline gap-2">
          <span className="text-base font-bold text-zinc-900">
            {formatCurrency(product.price)}
          </span>
          {product.onSale && product.salePrice != null ? (
            <span className="text-sm text-zinc-400 line-through">
              {formatCurrency(product.regularPrice)}
            </span>
          ) : null}
        </div>

        {!product.inStock ? (
          <p className="text-xs text-red-600">غير متوفر</p>
        ) : null}
      </div>
    </article>
  );
}
