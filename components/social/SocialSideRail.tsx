import {
  getSocialDisplaySettings,
  getSocialLinks,
} from "@/lib/cms/get-site-content";
import { SocialIconsList } from "@/components/social/SocialIconsList";

export async function SocialSideRail() {
  const [links, display] = await Promise.all([
    getSocialLinks(),
    getSocialDisplaySettings(),
  ]);

  if (!display.showSide || links.length === 0) return null;

  const positionClass =
    display.sidePosition === "end" ? "end-3 md:end-4" : "start-3 md:start-4";

  return (
    <aside
      className={`fixed top-1/2 z-40 hidden -translate-y-1/2 md:block ${positionClass}`}
      aria-label="وسائل التواصل — الشريط الجانبي"
    >
      <div className="rounded-2xl border border-brand-gray/80 bg-brand-white/95 p-2 shadow-lg backdrop-blur-sm">
        <SocialIconsList
          links={links}
          clickMode={display.clickMode}
          layout="vertical"
        />
      </div>
    </aside>
  );
}
