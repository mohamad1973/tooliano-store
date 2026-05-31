import Link from "next/link";
import { CategoryBanners } from "@/components/CategoryBanners";
import { GroupBuyOpportunitiesSection } from "@/components/group-buy/GroupBuyOpportunitiesSection";
import { SiteHeader } from "@/components/SiteHeader";
import { getCampaignConfig } from "@/lib/campaign-config";

export default function HomePage() {
  const { productId } = getCampaignConfig();

  return (
    <>
      <SiteHeader />
      <CategoryBanners />
      <GroupBuyOpportunitiesSection />
      <main className="flex min-h-[20vh] flex-col items-center justify-center gap-4 px-4 py-12">
        <Link
          href={`/campaign/${productId}`}
          className="rounded-xl bg-brand-gold px-8 py-3 text-sm font-bold text-brand-navy transition hover:bg-brand-gold/90"
        >
          شاهد عرض الشراء الجماعي الحالي
        </Link>
      </main>
    </>
  );
}
