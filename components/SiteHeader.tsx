import Image from "next/image";
import Link from "next/link";
import { getNavMenuItems, getSiteSettings, isMarqueeEnabled, getSocialDisplaySettings, getSocialLinks } from "@/lib/cms/get-site-content";
import { HeaderCmsNav } from "@/components/HeaderCmsNav";
import { HeaderIconsSocial } from "@/components/HeaderIconsSocial";
import { HeaderNotificationsBell } from "@/components/notifications/HeaderNotificationsBell";
import { TopMarquee } from "@/components/TopMarquee";

export async function SiteHeader() {
  const [settings, showMarquee, menuItems, socialLinks, socialDisplay] = await Promise.all([
    getSiteSettings(),
    isMarqueeEnabled(),
    getNavMenuItems(),
    getSocialLinks(),
    getSocialDisplaySettings(),
  ]);

  return (
    <div className="sticky top-0 z-50 shadow-[0_4px_24px_-8px_rgba(20,33,61,0.2)]">
      {showMarquee ? <TopMarquee /> : null}
      <header className="border-b border-brand-gray bg-brand-white backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-2 py-2 sm:px-3 sm:py-2.5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="shrink-0">
              <Link
                href="/"
                className="group flex items-center gap-2 leading-tight transition hover:opacity-90"
              >
                {settings.logoUrl ? (
                  <Image
                    src={settings.logoUrl}
                    alt={settings.siteName}
                    width={40}
                    height={40}
                    className="h-9 w-9 rounded-lg object-contain sm:h-10 sm:w-10"
                  />
                ) : null}
                <span className="flex flex-col">
                  <span className="text-lg font-bold text-brand-navy sm:text-xl">
                    {settings.siteName}
                  </span>
                  {settings.tagline ? (
                    <span className="text-[10px] font-medium text-brand-navy/60 sm:text-xs">
                      {settings.tagline}
                    </span>
                  ) : null}
                </span>
              </Link>
            </div>

            <div className="min-h-[2.5rem] min-w-0 flex-1 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-brand-gold/60">
              <div className="inline-flex min-w-max rounded-2xl border border-brand-gray bg-brand-white px-1.5 py-1 shadow-sm sm:px-2">
                <HeaderCmsNav items={menuItems} />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
              <HeaderNotificationsBell />
              <HeaderIconsSocial
                socialLinks={socialLinks}
                showSocial={socialDisplay.showHeader}
                clickMode={socialDisplay.clickMode}
              />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
