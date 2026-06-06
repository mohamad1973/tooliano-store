"use client";

import { useEffect, useRef, useState } from "react";
import { SocialPlatformIcon } from "@/components/social/SocialPlatformIcon";
import type { SocialLinkView } from "@/lib/cms/types";

type Props = {
  link: SocialLinkView;
  clickMode: "chooser" | "direct";
  buttonClassName?: string;
  onDark?: boolean;
};

export function SocialIconButton({
  link,
  clickMode,
  buttonClassName,
  onDark = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(t);
  }, [toast]);

  const baseClass =
    buttonClassName ??
    `flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-brand-gold/20 hover:text-brand-gold ${
      onDark ? "text-brand-white" : "text-brand-navy"
    }`;

  async function sharePage() {
    const url = window.location.href;
    const title = document.title;
    try {
      if (navigator.share) {
        await navigator.share({ url, title });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setToast("تم نسخ رابط الصفحة");
      }
    } catch {
      /* user cancelled */
    }
    setOpen(false);
  }

  function visitProfile() {
    window.open(link.url, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  function handleClick() {
    if (clickMode === "direct") {
      visitProfile();
      return;
    }
    setOpen((o) => !o);
  }

  return (
    <div className="relative" ref={ref} dir="rtl">
      <button
        type="button"
        onClick={handleClick}
        className={baseClass}
        aria-label={link.label}
        title={link.label}
      >
        <SocialPlatformIcon platform={link.platform} />
      </button>

      {open ? (
        <div className="absolute end-0 top-full z-[120] mt-1 min-w-[10rem] overflow-hidden rounded-xl border border-brand-gray bg-brand-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => void sharePage()}
            className="block w-full px-3 py-2 text-start text-xs font-semibold text-brand-navy hover:bg-brand-gray/40"
          >
            مشاركة الصفحة
          </button>
          <button
            type="button"
            onClick={visitProfile}
            className="block w-full px-3 py-2 text-start text-xs font-semibold text-brand-navy hover:bg-brand-gray/40"
          >
            زيارة {link.label}
          </button>
        </div>
      ) : null}

      {toast ? (
        <span className="absolute end-0 top-full z-[121] mt-1 whitespace-nowrap rounded-lg bg-brand-navy px-2 py-1 text-[10px] text-brand-white">
          {toast}
        </span>
      ) : null}
    </div>
  );
}
