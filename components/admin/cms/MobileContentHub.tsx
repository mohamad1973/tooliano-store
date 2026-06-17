"use client";

import { useCallback, useEffect, useState } from "react";
import { BannersEditor } from "@/components/admin/cms/BannersEditor";
import { FooterEditor } from "@/components/admin/cms/FooterEditor";
import { HomeSectionsDndEditor } from "@/components/admin/cms/HomeSectionsDndEditor";
import { MobileFooterSettingsForm } from "@/components/admin/cms/MobileFooterSettingsForm";
import { MobileHeaderSettingsForm } from "@/components/admin/cms/MobileHeaderSettingsForm";
import { MobileSocialPanel } from "@/components/admin/cms/MobileSocialPanel";
import type { MobileSaveStatus } from "@/components/admin/cms/mobile-save-utils";
import type { MobileDisplaySettings, SocialLinkView } from "@/lib/cms/types";

type HomeSection = {
  id: string;
  key: string;
  label: string;
  sortOrder: number;
  visible: boolean;
};

type HomeBanner = {
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

type FooterColumn = {
  id?: string;
  title: string;
  sortOrder: number;
  links: {
    id?: string;
    label: string;
    href: string;
    sortOrder: number;
    external: boolean;
  }[];
};

const SECTIONS = [
  { id: "header", label: "الهيدر والقائمة" },
  { id: "social", label: "السوشيال (موبايل)" },
  { id: "sections", label: "البنرات والأقسام" },
  { id: "footer", label: "الفوتر" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

type Props = {
  mobileSettings: MobileDisplaySettings;
  socialLinks: SocialLinkView[];
  socialClickMode: "chooser" | "direct";
  homeSections: HomeSection[];
  homeBanners: HomeBanner[];
  footerColumns: FooterColumn[];
};

function HubSaveToast({ status }: { status: MobileSaveStatus | null }) {
  if (!status) return null;

  const className =
    status.type === "error"
      ? "bg-red-50 text-red-800 border-red-200"
      : status.type === "saving"
        ? "bg-amber-50 text-amber-900 border-amber-200"
        : "bg-green-50 text-green-800 border-green-200";

  return (
    <p
      className={`sticky top-2 z-10 mb-4 rounded-xl border px-4 py-3 text-sm font-semibold shadow-sm ${className}`}
      role="status"
      aria-live="polite"
    >
      {status.text}
    </p>
  );
}

export function MobileContentHub({
  mobileSettings,
  socialLinks,
  socialClickMode,
  homeSections,
  homeBanners,
  footerColumns,
}: Props) {
  const [open, setOpen] = useState<SectionId | null>("header");
  const [hubStatus, setHubStatus] = useState<MobileSaveStatus | null>(null);

  const handleSaveStatus = useCallback((status: MobileSaveStatus | null) => {
    setHubStatus(status);
  }, []);

  useEffect(() => {
    if (!hubStatus || hubStatus.type === "saving") return;
    const t = setTimeout(() => setHubStatus(null), 3000);
    return () => clearTimeout(t);
  }, [hubStatus]);

  return (
    <div className="space-y-3" dir="rtl">
      <HubSaveToast status={hubStatus} />

      {SECTIONS.map((section) => {
        const isOpen = open === section.id;
        return (
          <div
            key={section.id}
            className="overflow-hidden rounded-2xl border border-brand-gray bg-brand-white"
          >
            <button
              type="button"
              onClick={() =>
                setOpen((prev) =>
                  prev === section.id ? null : section.id,
                )
              }
              className="flex w-full items-center justify-between px-5 py-4 text-start font-bold text-brand-navy transition hover:bg-brand-gray/30"
              aria-expanded={isOpen}
            >
              {section.label}
              <span className="text-brand-gold">{isOpen ? "−" : "+"}</span>
            </button>

            {isOpen ? (
              <div className="border-t border-brand-gray px-5 py-5">
                {section.id === "header" ? (
                  <MobileHeaderSettingsForm
                    initial={mobileSettings}
                    onSaveStatus={handleSaveStatus}
                  />
                ) : null}

                {section.id === "social" ? (
                  <MobileSocialPanel
                    initialLinks={socialLinks}
                    initialMobileSocialShowHeader={
                      mobileSettings.socialShowHeader
                    }
                    initialMobileSocialShowFooter={
                      mobileSettings.socialShowFooter
                    }
                    initialClickMode={socialClickMode}
                    onSaveStatus={handleSaveStatus}
                  />
                ) : null}

                {section.id === "sections" ? (
                  <div className="space-y-8">
                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-brand-navy/80">
                      الإظهار والترتيب موحّدان للموبايل والديسكتوب — يختلف
                      الشكل فقط على الشاشات الصغيرة.
                    </p>
                    <div>
                      <h3 className="mb-3 font-bold text-brand-navy">
                        أقسام الصفحة الرئيسية
                      </h3>
                      <HomeSectionsDndEditor initial={homeSections} />
                    </div>
                    <div>
                      <h3 className="mb-3 font-bold text-brand-navy">
                        بنرات التصنيفات
                      </h3>
                      <BannersEditor initial={homeBanners} />
                    </div>
                  </div>
                ) : null}

                {section.id === "footer" ? (
                  <div className="space-y-8">
                    <MobileFooterSettingsForm
                      initial={{
                        footerCompact: mobileSettings.footerCompact,
                        footerShowColumns: mobileSettings.footerShowColumns,
                      }}
                      onSaveStatus={handleSaveStatus}
                    />
                    <div>
                      <h3 className="mb-3 font-bold text-brand-navy">
                        أعمدة وروابط الفوتر
                      </h3>
                      <FooterEditor initial={footerColumns} />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
