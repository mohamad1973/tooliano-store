import Link from "next/link";

import { GroupBuyOpportunityCard } from "@/components/group-buy/GroupBuyOpportunityCard";
import { fetchActiveGroupBuyOpportunitiesForCategory } from "@/lib/group-buy-opportunities";

type Props = {
  categoryId: number;
  categoryName: string;
};

export async function GroupBuyOpportunitiesForCategory({
  categoryId,
  categoryName,
}: Props) {
  let opportunities: Awaited<
    ReturnType<typeof fetchActiveGroupBuyOpportunitiesForCategory>
  > = [];

  try {
    opportunities =
      await fetchActiveGroupBuyOpportunitiesForCategory(categoryId);
  } catch (err) {
    console.error("[GroupBuyOpportunitiesForCategory]", err);
  }

  if (opportunities.length === 0) return null;

  return (
    <section className="mt-12 border-t border-brand-gray pt-10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-brand-navy">
          فرص الشراء الجماعي — {categoryName}
        </h2>
        <p className="mt-1 text-sm text-brand-navy/70">
          عروض معتمدة مرتبطة بمنتجات هذا القسم — تشمل المنتهية والمنفّذة.
        </p>
      </div>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {opportunities.map((item) => (
          <li key={item.id}>
            <GroupBuyOpportunityCard opportunity={item} />
          </li>
        ))}
      </ul>
      <p className="mt-6 text-center text-sm text-brand-navy/60">
        <Link href="/campaign" className="font-semibold text-brand-gold hover:underline">
          عرض كل فرص الشراء الجماعي
        </Link>
      </p>
    </section>
  );
}
