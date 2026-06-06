"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminCmsMessage } from "@/components/admin/cms/AdminCmsMessage";
import { SOCIAL_PLATFORMS, type SocialPlatformId } from "@/lib/cms/social-platforms";
import type { SocialLinkView } from "@/lib/cms/types";

type DisplaySettings = {
  socialShowHeader: string;
  socialShowFooter: string;
  socialShowSide: string;
  socialSidePosition: string;
  socialClickMode: string;
};

type Props = {
  initialLinks: SocialLinkView[];
  initialDisplay: DisplaySettings;
};

export function SocialLinksEditor({ initialLinks, initialDisplay }: Props) {
  const router = useRouter();
  const [links, setLinks] = useState(initialLinks);
  const [display, setDisplay] = useState(initialDisplay);
  const [newPlatform, setNewPlatform] = useState<SocialPlatformId>(
    SOCIAL_PLATFORMS[0].id,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshLinks() {
    const res = await fetch("/api/admin/cms/social-links");
    const data = await res.json();
    if (res.ok) setLinks(data.items);
  }

  async function refreshDisplay() {
    const res = await fetch("/api/admin/cms/social-settings");
    const data = await res.json();
    if (res.ok) setDisplay(data);
  }

  async function addLink() {
    setError(null);
    const res = await fetch("/api/admin/cms/social-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: newPlatform }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "فشل الإضافة");
      return;
    }
    setMessage("تمت إضافة المنصة");
    await refreshLinks();
    router.refresh();
  }

  async function updateLink(
    id: string,
    patch: Partial<SocialLinkView>,
  ) {
    setError(null);
    const res = await fetch(`/api/admin/cms/social-links/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      setError("فشل التحديث");
      return;
    }
    setMessage("تم الحفظ");
    await refreshLinks();
    router.refresh();
  }

  async function deleteLink(id: string) {
    if (!confirm("حذف هذه المنصة؟")) return;
    await fetch(`/api/admin/cms/social-links/${id}`, { method: "DELETE" });
    setMessage("تم الحذف");
    await refreshLinks();
    router.refresh();
  }

  async function moveLink(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= links.length) return;
    const a = links[index];
    const b = links[next];
    await Promise.all([
      updateLink(a.id, { sortOrder: b.sortOrder }),
      updateLink(b.id, { sortOrder: a.sortOrder }),
    ]);
  }

  async function saveDisplay(patch: Partial<DisplaySettings>) {
    setError(null);
    const body: Record<string, boolean | string> = {};
    if (patch.socialShowHeader !== undefined) {
      body.socialShowHeader = patch.socialShowHeader === "true";
    }
    if (patch.socialShowFooter !== undefined) {
      body.socialShowFooter = patch.socialShowFooter === "true";
    }
    if (patch.socialShowSide !== undefined) {
      body.socialShowSide = patch.socialShowSide === "true";
    }
    if (patch.socialSidePosition !== undefined) {
      body.socialSidePosition = patch.socialSidePosition;
    }
    if (patch.socialClickMode !== undefined) {
      body.socialClickMode = patch.socialClickMode;
    }

    const res = await fetch("/api/admin/cms/social-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setError("فشل حفظ الإعدادات");
      return;
    }
    setMessage("تم حفظ إعدادات العرض");
    await refreshDisplay();
    router.refresh();
  }

  const usedPlatforms = new Set(links.map((l) => l.platform));
  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    (p) => p.id === "custom" || !usedPlatforms.has(p.id),
  );

  return (
    <div className="space-y-8" dir="rtl">
      <AdminCmsMessage message={message} error={error} />

      <section className="rounded-2xl border border-brand-gray bg-brand-white p-5">
        <h2 className="text-lg font-bold text-brand-navy">أماكن الظهور</h2>
        <p className="mt-1 text-sm text-brand-navy/60">
          يمكن تفعيل أكثر من مكان في نفس الوقت
        </p>
        <div className="mt-4 space-y-3">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={display.socialShowHeader === "true"}
              onChange={(e) =>
                void saveDisplay({
                  socialShowHeader: String(e.target.checked),
                })
              }
            />
            <span className="text-sm">الهيدر</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={display.socialShowFooter === "true"}
              onChange={(e) =>
                void saveDisplay({
                  socialShowFooter: String(e.target.checked),
                })
              }
            />
            <span className="text-sm">الفوتر</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={display.socialShowSide === "true"}
              onChange={(e) =>
                void saveDisplay({ socialShowSide: String(e.target.checked) })
              }
            />
            <span className="text-sm">شريط جانبي (فوق بعض — desktop)</span>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <fieldset>
            <legend className="mb-1 text-xs font-semibold text-brand-navy/70">
              موضع الشريط الجانبي
            </legend>
            <label className="me-3 inline-flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="sidePosition"
                checked={display.socialSidePosition === "start"}
                onChange={() =>
                  void saveDisplay({ socialSidePosition: "start" })
                }
              />
              يمين (RTL)
            </label>
            <label className="inline-flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="sidePosition"
                checked={display.socialSidePosition === "end"}
                onChange={() => void saveDisplay({ socialSidePosition: "end" })}
              />
              يسار (RTL)
            </label>
          </fieldset>

          <fieldset>
            <legend className="mb-1 text-xs font-semibold text-brand-navy/70">
              عند الضغط على الأيقونة
            </legend>
            <label className="me-3 inline-flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="clickMode"
                checked={display.socialClickMode === "chooser"}
                onChange={() =>
                  void saveDisplay({ socialClickMode: "chooser" })
                }
              />
              قائمة: مشاركة أو زيارة
            </label>
            <label className="inline-flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="clickMode"
                checked={display.socialClickMode === "direct"}
                onChange={() =>
                  void saveDisplay({ socialClickMode: "direct" })
                }
              />
              فتح الرابط مباشرة
            </label>
          </fieldset>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-gray bg-brand-white p-5">
        <h2 className="text-lg font-bold text-brand-navy">المنصات والروابط</h2>

        <div className="mt-4 flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-brand-navy">إضافة منصة</span>
            <select
              value={newPlatform}
              onChange={(e) =>
                setNewPlatform(e.target.value as SocialPlatformId)
              }
              className="rounded-lg border border-brand-gray px-3 py-2"
            >
              {availablePlatforms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.labelAr}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => void addLink()}
            className="rounded-lg bg-brand-gold px-4 py-2 text-sm font-bold text-brand-navy"
          >
            إضافة
          </button>
        </div>

        <ul className="mt-6 space-y-4">
          {links.map((link, index) => (
            <li
              key={link.id}
              className="rounded-xl border border-brand-gray/80 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-brand-navy">
                  {link.label} ({link.platform})
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => void moveLink(index, -1)}
                    className="rounded border px-2 py-1 text-xs disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === links.length - 1}
                    onClick={() => void moveLink(index, 1)}
                    className="rounded border px-2 py-1 text-xs disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteLink(link.id)}
                    className="rounded border border-red-200 px-2 py-1 text-xs text-red-700"
                  >
                    حذف
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                  <span>الاسم</span>
                  <input
                    defaultValue={link.label}
                    onBlur={(e) => {
                      if (e.target.value.trim() !== link.label) {
                        void updateLink(link.id, { label: e.target.value.trim() });
                      }
                    }}
                    className="rounded-lg border border-brand-gray px-3 py-2"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                  <span>رابط الصفحة</span>
                  <input
                    defaultValue={link.url}
                    onBlur={(e) => {
                      if (e.target.value.trim() !== link.url) {
                        void updateLink(link.id, { url: e.target.value.trim() });
                      }
                    }}
                    className="rounded-lg border border-brand-gray px-3 py-2"
                    dir="ltr"
                  />
                </label>
              </div>

              <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={link.enabled}
                  onChange={(e) =>
                    void updateLink(link.id, { enabled: e.target.checked })
                  }
                />
                مفعّل
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
