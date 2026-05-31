import Link from "next/link";
import { CategoryBanners } from "@/components/CategoryBanners";
import { GroupBuyOpportunitiesSection } from "@/components/group-buy/GroupBuyOpportunitiesSection";
import { getHomeSections } from "@/lib/cms/get-site-content";
import { getCampaignConfig } from "@/lib/campaign-config";

export async function HomePageSections() {
  const sections = await getHomeSections();
  const { productId } = getCampaignConfig();
  const keys = new Set(sections.map((s) => s.key));

  return (
    <>
      {keys.has("category_banners") ? <CategoryBanners /> : null}
      {keys.has("group_buy") ? <GroupBuyOpportunitiesSection /> : null}
      {keys.has("campaign_cta") ? (
        <main className="flex min-h-[20vh] flex-col items-center justify-center gap-4 px-4 py-12">
          <Link
            href={`/campaign/${productId}`}
            className="rounded-xl bg-brand-gold px-8 py-3 text-sm font-bold text-brand-navy transition hover:bg-brand-gold/90"
          >
            شاهد عرض الشراء الجماعي الحالي
          </Link>
        </main>
      ) : null}
    </>
  );
}
