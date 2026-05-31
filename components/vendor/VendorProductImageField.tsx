"use client";

import { useEffect, useRef, useState } from "react";
import { isValidProductImageUrl } from "@/lib/product-image-src";

const ACCEPT = "image/jpeg,image/png,image/webp";

function normalizeUploadedUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) return trimmed;
  if (trimmed.startsWith("uploads/")) return `/${trimmed}`;
  return trimmed;
}

type Props = {
  defaultUrl?: string | null;
  name?: string;
  /** رفع ملف اختياري — افتراضي /api/upload */
  uploadEndpoint?: string;
  onUploadStateChange?: (uploading: boolean) => void;
  /** إظهار قسم رفع الملف من الجهاز (اختياري) */
  showOptionalFileUpload?: boolean;
};

export function VendorProductImageField({
  defaultUrl = "",
  name = "productImageUrl",
  uploadEndpoint = "/api/upload",
  onUploadStateChange,
  showOptionalFileUpload = true,
}: Props) {
  const initial = normalizeUploadedUrl((defaultUrl ?? "").trim());
  const [imageUrl, setImageUrl] = useState(initial);
  const [preview, setPreview] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [uploadStorage, setUploadStorage] = useState<
    "local" | "wordpress" | null
  >(null);
  const [urlTouched, setUrlTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const urlValid = Boolean(imageUrl.trim() && isValidProductImageUrl(imageUrl));

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  function setUploadingState(next: boolean) {
    setUploading(next);
    onUploadStateChange?.(next);
  }

  function onUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = normalizeUploadedUrl(e.target.value);
    setUrlTouched(true);
    setError(null);
    setImageUrl(next);
    setPreview(next);
    setUploadStorage(null);
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    const localPreview = URL.createObjectURL(file);
    objectUrlRef.current = localPreview;
    setPreview(localPreview);
    setUploadingState(true);

    const body = new FormData();
    body.append("image", file);

    try {
      const res = await fetch(uploadEndpoint, {
        method: "POST",
        body,
      });
      const data = (await res.json()) as {
        url?: string;
        error?: string;
        storage?: string;
      };
      if (!res.ok || !data.url) {
        setError(data.error ?? "فشل رفع الصورة");
        setPreview(imageUrl || "");
        return;
      }
      const normalized = normalizeUploadedUrl(data.url);
      setImageUrl(normalized);
      setPreview(normalized);
      setUploadStorage(data.storage === "wordpress" ? "wordpress" : "local");
      setUrlTouched(false);
    } catch {
      setError("تعذر الاتصال بالخادم أثناء رفع الصورة");
      setPreview(imageUrl || "");
    } finally {
      setUploadingState(false);
      e.target.value = "";
    }
  }

  const urlError =
    urlTouched && imageUrl.trim() && !isValidProductImageUrl(imageUrl)
      ? "أدخل رابط https صالح للصورة (مثل رابط من tooliano.com أو أي استضافة عامة)"
      : null;

  return (
    <fieldset className="space-y-3 rounded-xl border border-brand-gray/80 p-4">
      <legend className="px-2 text-sm font-bold text-brand-navy">
        صورة المنتج
      </legend>

      <div>
        <label
          htmlFor="vendor-product-image-url"
          className="mb-1 block text-sm font-semibold text-brand-navy"
        >
          رابط صورة المنتج
        </label>
        <input
          id="vendor-product-image-url"
          type="url"
          name={name}
          value={imageUrl}
          onChange={onUrlChange}
          onBlur={() => setUrlTouched(true)}
          required={!urlValid}
          placeholder="https://tooliano.com/wp-content/uploads/..."
          dir="ltr"
          className="block w-full rounded-lg border border-brand-gray bg-brand-white px-3 py-2 text-sm text-brand-navy placeholder:text-brand-navy/40"
        />
        <p className="mt-1 text-xs text-brand-navy/60">
          ألصق رابط صورة عام (https). رفع الصورة إلى WordPress يتم عند نشر المنتج
          من الأدمن — وليس عند لصق الرابط.
        </p>
        {urlError ? (
          <p className="mt-1 text-xs text-red-600">{urlError}</p>
        ) : null}
      </div>

      {urlValid && preview && !uploading ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          تم تعيين رابط الصورة — احفظ النموذج لربطها بالمنتج
        </p>
      ) : null}

      {preview && (urlValid || uploading) ? (
        <div className="relative mx-auto aspect-square w-full max-w-[200px] overflow-hidden rounded-lg border border-brand-gray bg-brand-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="معاينة صورة المنتج"
            className="h-full w-full object-contain"
            onError={() => {
              if (urlTouched) {
                setError("تعذر تحميل المعاينة — تأكد أن الرابط يعمل في المتصفح");
              }
            }}
          />
        </div>
      ) : null}

      {showOptionalFileUpload ? (
        <details className="rounded-lg border border-brand-gray/60 bg-brand-gray/20 p-3">
          <summary className="cursor-pointer text-xs font-semibold text-brand-navy">
            رفع من الجهاز (اختياري — للاستخدام لاحقاً)
          </summary>
          <div className="mt-3 space-y-2">
            <label
              htmlFor="vendor-product-image-file"
              className="mb-1 block text-xs font-semibold text-brand-navy"
            >
              اختيار ملف JPG / PNG / WebP
            </label>
            <input
              id="vendor-product-image-file"
              type="file"
              accept={ACCEPT}
              disabled={uploading}
              onChange={onFileChange}
              className="block w-full text-sm text-brand-navy file:me-3 file:rounded-lg file:border-0 file:bg-brand-gold file:px-3 file:py-2 file:text-xs file:font-semibold file:text-brand-navy hover:file:bg-brand-gold/90 disabled:opacity-60"
            />
            <p className="text-xs text-brand-navy/50">
              عند النجاح يُستبدل رابط الحقل أعلاه بالرابط الناتج من الرفع.
            </p>
            {uploadStorage === "wordpress" ? (
              <p className="text-xs text-emerald-800">تم الرفع إلى وسائط WordPress</p>
            ) : null}
            {uploadStorage === "local" ? (
              <p className="text-xs text-emerald-800">تم الحفظ على المتجر (محلي)</p>
            ) : null}
          </div>
        </details>
      ) : null}

      {uploading ? (
        <p className="text-sm text-brand-navy/70">جاري رفع الصورة…</p>
      ) : null}

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {!imageUrl.trim() && !uploading ? (
        <p className="text-xs text-amber-800">
          ألصق رابط الصورة قبل إرسال الطلب.
        </p>
      ) : null}
    </fieldset>
  );
}
