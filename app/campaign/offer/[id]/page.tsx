import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { CampaignFaq } from "@/components/landing/CampaignFaq";
import { CountdownTimer } from "@/components/landing/CountdownTimer";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PriceComparison } from "@/components/landing/PriceComparison";
import { ProductGallery } from "@/components/landing/ProductGallery";
import { QuantityProgress } from "@/components/landing/QuantityProgress";
import { ReserveSection } from "@/components/landing/ReserveSection";
import { StickyReserveBar } from "@/components/landing/StickyReserveBar";
import { WalletPolicySection } from "@/components/landing/WalletPolicySection";
import { WhyGroupBuy } from "@/components/landing/WhyGroupBuy";
import { ProductSpecsSection } from "@/components/product/ProductSpecsSection";
import {
  productConditionBadgeClass,
  productConditionLabel,
} from "@/lib/product-condition-labels";
import { formatCurrency } from "@/lib/format";
import { getSession } from "@/lib/auth/session";
import { USER_ROLES } from "@/lib/db/constants";
import { requireSubmissionCampaign } from "@/lib/submission-campaign";
import { SITE_NAME } from "@/lib/constants";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { fetchSubmissionCampaignById } = await import(
    "@/lib/submission-campaign"
  );
  const campaign = await fetchSubmissionCampaignById(id);
  if (!campaign) return { title: "شراء جماعي" };
  return {
    title: `${campaign.productName} — شراء جماعي | ${SITE_NAME}`,
    description: `احجز ${campaign.productName} بسعر جماعي — ${campaign.vendorCompanyName}`,
  };
}

export default async function OfferCampaignPage({ params }: Props) {
  const { id } = await params;
  const campaign = await requireSubmissionCampaign(id);
  const session = await getSession();
  const isLoggedIn = Boolean(session);
  const isBuyer = session?.role === USER_ROLES.BUYER;

  return (
    <>
      <SiteHeader />
      <StickyReserveBar groupPriceLabel={formatCurrency(campaign.groupPrice)} />

      <section className="bg-brand-navy py-10 text-brand-white sm:py-14">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-center text-sm font-semibold text-brand-gold">
            فرصة شراء جماعي
          </p>
          <h1 className="mt-2 text-center text-3xl font-bold leading-tight sm:text-4xl">
            {campaign.productName}
          </h1>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${productConditionBadgeClass(campaign.productCondition)}`}
            >
              {productConditionLabel(campaign.productCondition)}
            </span>
            <span className="rounded-full bg-brand-white/15 px-3 py-1 text-xs text-brand-white/90">
              {campaign.productType}
            </span>
          </div>
          <p className="mt-2 text-center text-base font-semibold text-brand-gold">
            {campaign.vendorCompanyName}
          </p>
          <div className="mt-8 flex justify-center">
            <a
              href="#reserve"
              className="rounded-xl bg-brand-gold px-8 py-3.5 text-base font-bold text-brand-navy transition hover:bg-brand-gold/90"
            >
              احجز قطعتك الآن
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-brand-gray bg-brand-white py-8">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 text-center text-sm font-bold text-brand-navy">
              الوقت المتبقي للعرض
            </h3>
            <CountdownTimer endsAt={campaign.campaignEndsAt} />
          </div>
          <QuantityProgress
            targetQuantity={campaign.targetQuantity}
            reservedQuantity={campaign.reservedQuantity}
          />
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2 lg:gap-12">
          <ProductGallery
            images={campaign.images}
            productName={campaign.productName}
          />
          <div className="flex flex-col gap-6">
            <PriceComparison
              retailPrice={campaign.retailPrice}
              groupPrice={campaign.groupPrice}
              targetQuantity={campaign.targetQuantity}
            />
            <ReserveSection
              submissionId={campaign.id}
              groupPrice={campaign.groupPrice}
              productName={campaign.productName}
              isLoggedIn={isLoggedIn}
              isBuyer={isBuyer}
            />
          </div>
        </div>
      </section>

      <section className="border-t border-brand-gray bg-brand-gray/30 py-10">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-6 text-2xl font-bold text-brand-navy">
            تفاصيل المنتج
          </h2>
          <ProductSpecsSection
            productCondition={campaign.productCondition}
            productType={campaign.productType}
            specWatts={campaign.specWatts}
            specVoltage={campaign.specVoltage}
            specCapacity={campaign.specCapacity}
            specPower={campaign.specPower}
            specColor={campaign.specColor}
            specExtra={campaign.specExtra}
            outletReason={campaign.outletReason}
            productDescription={campaign.productDescription}
          />
        </div>
      </section>

      <WhyGroupBuy />
      <HowItWorks />
      <WalletPolicySection />
      <CampaignFaq />

      <section className="bg-brand-gray/40 py-8 pb-24 md:pb-8">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-4 px-4">
          <Link
            href="/"
            className="text-sm font-semibold text-brand-navy hover:text-brand-gold"
          >
            ← الرئيسية
          </Link>
          {campaign.wooProductId ? (
            <Link
              href={`/products/${campaign.wooProductId}`}
              className="text-sm font-semibold text-brand-gold hover:underline"
            >
              المنتج في المتجر
            </Link>
          ) : null}
        </div>
      </section>
    </>
  );
}
