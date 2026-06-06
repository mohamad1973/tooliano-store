import Link from "next/link";
import { SocialIconsList } from "@/components/social/SocialIconsList";
import { getFooterColumns, getSiteSettings, getSocialDisplaySettings, getSocialLinks } from "@/lib/cms/get-site-content";

export async function SiteFooter() {
  const [columns, settings, socialLinks, socialDisplay] = await Promise.all([
    getFooterColumns(),
    getSiteSettings(),
    getSocialLinks(),
    getSocialDisplaySettings(),
  ]);

  if (columns.length === 0) return null;

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-gray bg-brand-navy text-brand-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((col) => (
          <div key={col.id}>
            <h3 className="text-sm font-bold text-brand-gold">{col.title}</h3>
            <ul className="mt-3 flex flex-col gap-2">
              {col.links.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-white/80 transition hover:text-brand-gold"
                    {...(link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {socialDisplay.showFooter && socialLinks.length > 0 ? (
        <div className="border-t border-brand-white/10 py-5">
          <SocialIconsList
            links={socialLinks}
            clickMode={socialDisplay.clickMode}
            layout="horizontal"
            className="justify-center"
            onDark
            buttonClassName="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-brand-white transition hover:bg-brand-white/15 hover:text-brand-gold"
          />
        </div>
      ) : null}
      <div className="border-t border-brand-white/10 py-4 text-center text-xs text-brand-white/60">
        © {year} {settings.siteName}. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
