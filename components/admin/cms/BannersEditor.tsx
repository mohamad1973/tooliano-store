"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminCmsMessage } from "@/components/admin/cms/AdminCmsMessage";
import {
  HOME_BANNER_PLACEMENT_LABELS,
  HOME_BANNER_PLACEMENTS,
  type HomeBannerPlacement,
} from "@/lib/cms/home-banner-layout";

const ACCEPT = "image/jpeg,image/png,image/webp";

type Item = {
  id: string;
  imageUrl: string;
  categorySlug: string | null;
  title: string | null;
  placement: string;
  href: string | null;
  altText: string | null;
  sortOrder: number;
  enabled: boolean;
};

const PLACEMENTS = Object.values(HOME_BANNER_PLACEMENTS);

type BannerFormState = {
  imageUrl: string;
  categorySlug: string;
  title: string;
  placement: HomeBannerPlacement;
  href: string;
  altText: string;
};

async function extractError(res: Response, fallback: string): Promise<string> {
  let serverError: string | null = null;
  try {
    const data = (await res.json()) as { error?: string };
    if (data?.error) serverError = data.error;
  } catch {
    // الرد ليس JSON
  }
  if (res.status === 401) {
    return "انتهت جلسة الدخول — سجّل الدخول من جديد ثم أعد المحاولة";
  }
  if (res.status === 403) {
    return serverError ?? "غير مصرح — هذا الحساب ليس أدمن";
  }
  return serverError ?? `${fallback} (رمز الخطأ ${res.status})`;
}

export function BannersEditor({ initial }: { initial: Item[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [newBanner, setNewBanner] = useState<BannerFormState>({
    imageUrl: "/banners/tools.jpg",
    categorySlug: "",
    title: "",
    placement: HOME_BANNER_PLACEMENTS.HERO_MAIN,
    href: "",
    altText: "",
  });

  async function refresh() {
    router.refresh();
    const res = await fetch("/api/admin/cms/banners");
    const data = await res.json();
    if (res.ok) setItems(data.items);
  }

  async function uploadImage(file: File): Promise<string | null> {
    setError(null);
    setMessage(null);
    const body = new FormData();
    body.append("image", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      if (!res.ok) {
        setError(await extractError(res, "فشل رفع الصورة"));
        return null;
      }
      const data = (await res.json()) as { url?: string };
      if (!data.url) {
        setError("فشل رفع الصورة — لم يرجع الخادم رابطاً");
        return null;
      }
      return data.url;
    } catch {
      setError("تعذّر الاتصال بالخادم أثناء رفع الصورة");
      return null;
    }
  }

  async function saveItem(item: Item) {
    setError(null);
    setMessage(null);
    let res: Response;
    try {
      res = await fetch(`/api/admin/cms/banners/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: item.imageUrl,
          categorySlug: item.categorySlug || null,
          title: item.title || null,
          placement: item.placement,
          href: item.href || null,
          altText: item.altText || null,
          enabled: item.enabled,
        }),
      });
    } catch {
      setError("تعذّر الاتصال بالخادم — تحقق من الإنترنت ثم أعد المحاولة");
      return;
    }
    if (!res.ok) setError(await extractError(res, "فشل الحفظ"));
    else {
      setMessage("تم الحفظ");
      await refresh();
    }
  }

  async function onItemFileChange(
    item: Item,
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingFor(item.id);
    const url = await uploadImage(file);
    setUploadingFor(null);
    if (!url) return;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, imageUrl: url } : i)),
    );
    await saveItem({ ...item, imageUrl: url });
  }

  async function onNewBannerFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingFor("new");
    const url = await uploadImage(file);
    setUploadingFor(null);
    if (!url) return;
    setNewBanner((b) => ({ ...b, imageUrl: url }));
    setMessage("تم رفع الصورة — اضغط «إضافة بنر» لحفظ البنر الجديد");
  }

  async function addBanner() {
    setError(null);
    setMessage(null);
    let res: Response;
    try {
      res = await fetch("/api/admin/cms/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBanner),
      });
    } catch {
      setError("تعذّر الاتصال بالخادم — تحقق من الإنترنت ثم أعد المحاولة");
      return;
    }
    if (!res.ok) {
      setError(await extractError(res, "فشل الإضافة"));
      return;
    }
    setMessage("تمت الإضافة");
    await refresh();
  }

  async function deleteBanner(id: string) {
    if (!confirm("حذف البنر؟")) return;
    setError(null);
    setMessage(null);
    const res = await fetch(`/api/admin/cms/banners/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError(await extractError(res, "فشل الحذف"));
      return;
    }
    await refresh();
  }

  return (
    <div className="space-y-4">
      <AdminCmsMessage message={message} error={error} />
      {items.map((item) => (
        <div
          key={item.id}
          className="grid gap-3 rounded-xl border border-brand-gray bg-brand-white p-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
            {item.imageUrl ? (
              <div className="h-16 w-28 overflow-hidden rounded-lg border border-brand-gray bg-brand-gray/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.title ?? "معاينة البنر"}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
            <label className="cursor-pointer rounded-lg bg-brand-navy px-3 py-2 text-xs font-bold text-brand-white">
              {uploadingFor === item.id
                ? "جاري رفع الصورة…"
                : "رفع صورة من الجهاز"}
              <input
                type="file"
                accept={ACCEPT}
                disabled={uploadingFor !== null}
                onChange={(e) => onItemFileChange(item, e)}
                className="hidden"
              />
            </label>
            <span className="text-xs text-brand-navy/60">
              JPG / PNG / WebP — تُحفَظ تلقائياً بعد الرفع
            </span>
          </div>
          <label className="text-sm">
            نوع العنصر
            <select
              value={item.placement}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((i) =>
                    i.id === item.id ? { ...i, placement: e.target.value } : i,
                  ),
                )
              }
              className="mt-1 w-full rounded-lg border px-2 py-1 text-sm"
            >
              {PLACEMENTS.map((placement) => (
                <option key={placement} value={placement}>
                  {HOME_BANNER_PLACEMENT_LABELS[placement as HomeBannerPlacement]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            رابط الصورة
            <input
              value={item.imageUrl}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((i) =>
                    i.id === item.id ? { ...i, imageUrl: e.target.value } : i,
                  ),
                )
              }
              className="mt-1 w-full rounded-lg border px-2 py-1 text-sm"
              dir="ltr"
            />
          </label>
          <label className="text-sm">
            رابط مباشر (اختياري)
            <input
              value={item.href ?? ""}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((i) =>
                    i.id === item.id
                      ? { ...i, href: e.target.value || null }
                      : i,
                  ),
                )
              }
              className="mt-1 w-full rounded-lg border px-2 py-1 text-sm"
              placeholder="/products?category=slug"
              dir="ltr"
            />
          </label>
          <label className="text-sm">
            slug التصنيف (WooCommerce)
            <input
              value={item.categorySlug ?? ""}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((i) =>
                    i.id === item.id
                      ? { ...i, categorySlug: e.target.value || null }
                      : i,
                  ),
                )
              }
              className="mt-1 w-full rounded-lg border px-2 py-1 text-sm"
              dir="ltr"
            />
          </label>
          <label className="text-sm">
            عنوان مخصص (اختياري)
            <input
              value={item.title ?? ""}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((i) =>
                    i.id === item.id
                      ? { ...i, title: e.target.value || null }
                      : i,
                  ),
                )
              }
              className="mt-1 w-full rounded-lg border px-2 py-1 text-sm"
            />
          </label>
          <label className="text-sm">
            نص بديل للصورة (اختياري)
            <input
              value={item.altText ?? ""}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((i) =>
                    i.id === item.id
                      ? { ...i, altText: e.target.value || null }
                      : i,
                  ),
                )
              }
              className="mt-1 w-full rounded-lg border px-2 py-1 text-sm"
            />
          </label>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={item.enabled}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((i) =>
                      i.id === item.id ? { ...i, enabled: e.target.checked } : i,
                    ),
                  )
                }
              />
              مفعّل
            </label>
            <button
              type="button"
              onClick={() => saveItem(item)}
              className="rounded-lg bg-brand-gold px-3 py-1 text-xs font-bold text-brand-navy"
            >
              حفظ
            </button>
            <button
              type="button"
              onClick={() => deleteBanner(item.id)}
              className="text-xs text-red-600"
            >
              حذف
            </button>
          </div>
        </div>
      ))}
      <div className="rounded-xl border border-dashed border-brand-gold p-4">
        <p className="mb-2 text-sm font-bold text-brand-navy">بنر جديد</p>
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-lg bg-brand-navy px-3 py-2 text-xs font-bold text-brand-white">
            {uploadingFor === "new" ? "جاري رفع الصورة…" : "رفع صورة من الجهاز"}
            <input
              type="file"
              accept={ACCEPT}
              disabled={uploadingFor !== null}
              onChange={onNewBannerFileChange}
              className="hidden"
            />
          </label>
          <span className="text-xs text-brand-navy/60">
            أو ألصق رابط الصورة في الحقل أدناه
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <select
            value={newBanner.placement}
            onChange={(e) =>
              setNewBanner((b) => ({
                ...b,
                placement: e.target.value as HomeBannerPlacement,
              }))
            }
            className="rounded-lg border px-2 py-1 text-sm"
          >
            {PLACEMENTS.map((placement) => (
              <option key={placement} value={placement}>
                {HOME_BANNER_PLACEMENT_LABELS[placement as HomeBannerPlacement]}
              </option>
            ))}
          </select>
          <input
            value={newBanner.imageUrl}
            onChange={(e) =>
              setNewBanner((b) => ({ ...b, imageUrl: e.target.value }))
            }
            placeholder="رابط الصورة"
            className="rounded-lg border px-2 py-1 text-sm"
            dir="ltr"
          />
          <input
            value={newBanner.title}
            onChange={(e) =>
              setNewBanner((b) => ({ ...b, title: e.target.value }))
            }
            placeholder="العنوان"
            className="rounded-lg border px-2 py-1 text-sm"
          />
          <input
            value={newBanner.categorySlug}
            onChange={(e) =>
              setNewBanner((b) => ({ ...b, categorySlug: e.target.value }))
            }
            placeholder="slug التصنيف"
            className="rounded-lg border px-2 py-1 text-sm"
            dir="ltr"
          />
          <input
            value={newBanner.href}
            onChange={(e) =>
              setNewBanner((b) => ({ ...b, href: e.target.value }))
            }
            placeholder="رابط مباشر اختياري"
            className="rounded-lg border px-2 py-1 text-sm"
            dir="ltr"
          />
          <input
            value={newBanner.altText}
            onChange={(e) =>
              setNewBanner((b) => ({ ...b, altText: e.target.value }))
            }
            placeholder="نص بديل للصورة"
            className="rounded-lg border px-2 py-1 text-sm"
          />
          <button
            type="button"
            onClick={addBanner}
            className="rounded-lg bg-brand-navy py-1 text-sm font-bold text-brand-white"
          >
            إضافة بنر
          </button>
        </div>
      </div>
    </div>
  );
}
