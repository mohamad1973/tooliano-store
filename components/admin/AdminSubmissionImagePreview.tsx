import {
  isValidProductImageUrl,
  normalizeProductImageSrc,
} from "@/lib/product-image-src";

type Props = {
  url: string | null;
  alt: string;
  /** من السيرفر — لا يُسقِط الروابط العامة عند العرض في الأدمن */
  displaySrc?: string | null;
};

export function AdminSubmissionImagePreview({ url, alt, displaySrc }: Props) {
  if (!url) {
    return <p className="mt-2 text-xs text-red-600">⚠ لا توجد صورة</p>;
  }

  const resolved = displaySrc ?? normalizeProductImageSrc(url) ?? url;

  if (!isValidProductImageUrl(url)) {
    return (
      <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
        <p className="font-semibold">رابط صورة غير صالح للعرض</p>
        <p className="mt-1 break-all opacity-80">{url}</p>
        <p className="mt-1">ارفع صورة من جهازك من لوحة البائع.</p>
      </div>
    );
  }

  return (
    <div className="mt-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolved}
        alt={alt}
        className="max-h-40 w-full rounded-lg border border-brand-gray object-contain bg-brand-gray/20"
      />
      <a
        href={resolved}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-block text-xs text-brand-gold hover:underline"
      >
        فتح الصورة في تبويب جديد
      </a>
    </div>
  );
}
