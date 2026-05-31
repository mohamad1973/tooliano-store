"use client";

import Image from "next/image";
import { useState } from "react";
import { normalizeProductImageSrc } from "@/lib/product-image-src";
import type { ProductImage } from "@/types/product";

type Props = {
  images: ProductImage[];
  productName: string;
};

export function ProductGallery({ images, productName }: Props) {
  const list = images
    .map((img) => ({
      ...img,
      src: normalizeProductImageSrc(img.src) ?? img.src,
    }))
    .filter((img) => Boolean(img.src));
  const [active, setActive] = useState(0);
  const current = list[active] ?? list[0];

  if (!current) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-brand-gray text-brand-navy/50">
        بدون صورة
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-brand-gray bg-brand-gray shadow-lg">
        <Image
          src={current.src}
          alt={current.alt || productName}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      {list.length > 1 ? (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {list.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => setActive(i)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-20 sm:w-20 ${
                  i === active
                    ? "border-brand-gold ring-2 ring-brand-gold/30"
                    : "border-brand-gray opacity-80 hover:opacity-100"
                }`}
                aria-label={`صورة ${i + 1}`}
                aria-current={i === active}
              >
                <Image
                  src={img.src}
                  alt={img.alt || productName}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
