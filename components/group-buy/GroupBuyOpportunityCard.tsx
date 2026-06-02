import Image from "next/image";
import Link from "next/link";
import { CountdownTimer } from "@/components/landing/CountdownTimer";
import { QuantityProgress } from "@/components/landing/QuantityProgress";
import { formatCurrency } from "@/lib/format";
import type { GroupBuyOpportunity } from "@/lib/group-buy-opportunities";
import {
  productConditionBadgeClass,
  productConditionLabel,
} from "@/lib/product-condition-labels";

type Props = {
  opportunity: GroupBuyOpportunity;
};

export function GroupBuyOpportunityCard({ opportunity }: Props) {
  const href = `/campaign/offer/${opportunity.id}`;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-gray bg-brand-white shadow-sm transition hover:border-brand-gold/60 hover:shadow-md">
      <Link href={href} className="relative block aspect-[4/3] bg-brand-gray/30">
        {opportunity.productImageUrl ? (
          <Image
            src={opportunity.productImageUrl}
            alt={opportunity.productName}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-brand-navy/40">
            بدون صورة
          </div>
        )}
        <div className="absolute start-3 top-3 flex flex-col gap-1">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${productConditionBadgeClass(opportunity.productCondition)}`}
          >
            {productConditionLabel(opportunity.productCondition)}
          </span>
          <span className="rounded-full bg-brand-navy/90 px-2.5 py-0.5 text-[10px] font-semibold text-brand-white">
            {opportunity.productType}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={href}>
          <h3 className="line-clamp-2 text-base font-bold text-brand-navy hover:text-brand-gold">
            {opportunity.productName}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-brand-navy/60">
          {opportunity.vendorCompanyName}
        </p>
        <p className="mt-2 text-sm font-semibold text-brand-gold">
          {formatCurrency(opportunity.suggestedGroupPrice)}
          <span className="ms-1 text-xs font-normal text-brand-navy/50 line-through">
            {formatCurrency(opportunity.suggestedRetailPrice)}
          </span>
        </p>

        <div className="mt-4 flex flex-1 flex-col space-y-3">
          <div>
            <h4 className="mb-2 text-center text-xs font-bold text-brand-navy">
              الوقت المتبقي للعرض
            </h4>
            <CountdownTimer
              endsAt={opportunity.campaignEndsAt.toISOString()}
              compact
            />
          </div>
          <QuantityProgress
            targetQuantity={opportunity.targetQuantity}
            reservedQuantity={opportunity.reservedQuantity}
            boostReservedQuantity={opportunity.boostReservedQuantity}
            compact
          />
        </div>

        <Link
          href={href}
          className="mt-4 block rounded-xl bg-brand-gold py-2.5 text-center text-sm font-bold text-brand-navy transition hover:bg-brand-gold/90"
        >
          شارك في الشراء الجماعي
        </Link>
      </div>
    </article>
  );
}
