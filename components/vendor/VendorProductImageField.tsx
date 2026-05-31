"use client";

import { useEffect, useRef, useState } from "react";

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
  /** مسار الرفع — للتسجيل استخدم /api/register/vendor-upload-image */
  uploadEndpoint?: string;
  onUploadStateChange?: (uploading: boolean) => void;
};

export function VendorProductImageField({
  defaultUrl = "",
  name = "productImageUrl",
  uploadEndpoint = "/api/vendor/upload-image",
  onUploadStateChange,
}: Props) {
  const initial = normalizeUploadedUrl((defaultUrl ?? "").trim());
  const [imageUrl, setImageUrl] = useState(initial);
  const [preview, setPreview] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(Boolean(initial));
  const [uploadStorage, setUploadStorage] = useState<
    "local" | "wordpress" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

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

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploaded(false);

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
      setUploaded(true);
    } catch {
      setError("تعذر الاتصال بالخادم أثناء رفع الصورة");
      setPreview(imageUrl || "");
    } finally {
      setUploadingState(false);
      e.target.value = "";
    }
  }

  return (
    <fieldset className="space-y-3 rounded-xl border border-brand-gray/80 p-4">
      <legend className="px-2 text-sm font-bold text-brand-navy">
        صورة المنتج
      </legend>

      <input type="hidden" name={name} value={imageUrl} required={!imageUrl} />

      <div>
        <label
          htmlFor="vendor-product-image-file"
          className="mb-1 block text-sm font-semibold text-brand-navy"
        >
          رفع صورة من الجهاز
        </label>
        <input
          id="vendor-product-image-file"
          type="file"
          accept={ACCEPT}
          disabled={uploading}
          onChange={onFileChange}
          className="block w-full text-sm text-brand-navy file:me-3 file:rounded-lg file:border-0 file:bg-brand-gold file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-navy hover:file:bg-brand-gold/90 disabled:opacity-60"
        />
        <p className="mt-1 text-xs text-brand-navy/60">
          JPG أو PNG أو WebP — حتى 5 ميجابايت. يُرفع تلقائياً إلى وسائط
          WordPress على الإنتاج، أو إلى مجلد المتجر محلياً. اضغط «حفظ
          التعديلات» ثم «نشر على WordPress» للمنتج في WooCommerce.
        </p>
      </div>

      {uploading ? (
        <p className="text-sm text-brand-navy/70">جاري رفع الصورة…</p>
      ) : null}

      {uploaded && imageUrl && !uploading ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {uploadStorage === "wordpress"
            ? "تم رفع الصورة إلى وسائط WordPress — اضغط «حفظ التعديلات» لربطها بالمنتج"
            : "تم حفظ الصورة — اضغط «حفظ التعديلات» لربطها بالمنتج"}
        </p>
      ) : null}

      {preview ? (
        <div className="relative mx-auto aspect-square w-full max-w-[200px] overflow-hidden rounded-lg border border-brand-gray bg-brand-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="معاينة صورة المنتج"
            className="h-full w-full object-contain"
          />
        </div>
      ) : null}

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {!imageUrl && !uploading ? (
        <p className="text-xs text-amber-800">
          اختر صورة من جهازك قبل إرسال الطلب.
        </p>
      ) : null}
    </fieldset>
  );
}
