import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { CampaignLandingBlocks } from "@/components/landing/CampaignLandingBlocks";
import { CountdownTimer } from "@/components/landing/CountdownTimer";
import { PriceComparison } from "@/components/landing/PriceComparison";
import { ProductGallery } from "@/components/landing/ProductGallery";
import { QuantityProgress } from "@/components/landing/QuantityProgress";
import { StickyReserveBar } from "@/components/landing/StickyReserveBar";
import { WhyGroupBuy } from "@/components/landing/WhyGroupBuy";
import { getCampaignConfig } from "@/lib/campaign-config";
import { formatCurrency } from "@/lib/format";
import { fetchProductDetailById } from "@/lib/product-detail";
import { fetchSubmissionCampaignByWooProductId } from "@/lib/submission-campaign";
import { SITE_NAME } from "@/lib/constants";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const productId = Number.parseInt(id, 10);
  const product = Number.isFinite(productId)
    ? await fetchProductDetailById(productId)
    : null;
  if (!product) return { title: "حملة شراء جماعي" };
  return {
    title: `${product.name} — شراء جماعي | ${SITE_NAME}`,
    description: `احجز ${product.name} بسعر جماعي حصري على ${SITE_NAME}`,
  };
}

export default async function CampaignLandingPage({ params }: Props) {
  const { id } = await params;
  const productId = Number.parseInt(id, 10);
  if (!Number.isFinite(productId)) notFound();

  const product = await fetchProductDetailById(productId);
  if (!product) notFound();

  const submissionCampaign =
    await fetchSubmissionCampaignByWooProductId(productId);
  if (submissionCampaign) {
    redirect(`/campaign/offer/${submissionCampaign.id}`);
  }

  const campaign = getCampaignConfig(productId);

  return (
    <>
      <SiteHeader />
      <StickyReserveBar groupPriceLabel={formatCurrency(campaign.groupPrice)} />

      {/* Hero */}
      <section className="bg-brand-navy py-10 text-brand-white sm:py-14">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-center text-sm font-semibold text-brand-gold">
            عرض شراء جماعي محدود
          </p>
          <h1 className="mt-2 text-center text-3xl font-bold leading-tight sm:text-4xl">
            {campaign.headline}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-brand-white/85 sm:text-base">
            {campaign.subheadline}
          </p>
          <h2 className="mt-6 text-center text-xl font-bold text-brand-gold sm:text-2xl">
            {product.name}
          </h2>
          {product.categories[0] ? (
            <p className="mt-1 text-center text-sm text-brand-white/60">
              {product.categories[0].name}
            </p>
          ) : null}
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

      {/* عدادات */}
      <section className="border-b border-brand-gray bg-brand-white py-8">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 text-center text-sm font-bold text-brand-navy">
              الوقت المتبقي للعرض
            </h3>
            <CountdownTimer endsAt={campaign.endsAt} />
          </div>
          <QuantityProgress
            targetQuantity={campaign.targetQuantity}
            reservedQuantity={campaign.reservedQuantity}
          />
        </div>
      </section>

      {/* منتج + أسعار + حجز */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2 lg:gap-12">
          <ProductGallery images={product.images} productName={product.name} />
          <div className="flex flex-col gap-6">
            <PriceComparison
              retailPrice={campaign.retailPrice}
              groupPrice={campaign.groupPrice}
              targetQuantity={campaign.targetQuantity}
            />
            <div
              id="reserve"
              className="scroll-mt-24 rounded-2xl border-2 border-brand-gray bg-brand-white p-6 text-center shadow-lg sm:p-8"
            >
              <h2 className="text-xl font-bold text-brand-navy">احجز الآن</h2>
              <p className="mt-3 text-sm text-brand-navy/70">
                الحجز الجماعي متاح عبر العروض المعتمدة من التجار على المتجر.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-block rounded-xl bg-brand-gold px-6 py-3 text-sm font-bold text-brand-navy transition hover:bg-brand-gold/90"
              >
                تصفّح فرص الشراء الجماعي
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* وصف قصير */}
      {product.shortDescription ? (
        <section className="border-t border-brand-gray bg-brand-gray/30 py-10">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <div
              className="text-base leading-relaxed text-brand-navy/80 [&_p]:mb-2"
              dangerouslySetInnerHTML={{ __html: product.shortDescription }}
            />
          </div>
        </section>
      ) : null}

      <WhyGroupBuy />
      <CampaignLandingBlocks />

      {/* تفاصيل المنتج */}
      {product.descriptionHtml ? (
        <section className="py-10 sm:py-14">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="mb-6 text-2xl font-bold text-brand-navy">
              تفاصيل المنتج
            </h2>
            <div
              className="space-y-3 text-sm leading-relaxed text-brand-navy/80 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold [&_li]:ms-4 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:ps-4"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
            {product.sku ? (
              <p className="mt-6 text-xs text-brand-navy/50">
                رمز المنتج: {product.sku}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="bg-brand-gray/40 py-8 pb-24 md:pb-8">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-4 px-4">
          <Link
            href="/products"
            className="text-sm font-semibold text-brand-navy hover:text-brand-gold"
          >
            ← كل المنتجات
          </Link>
          <Link
            href={`/products/${product.id}`}
            className="text-sm font-semibold text-brand-gold hover:underline"
          >
            صفحة المنتج العادية
          </Link>
        </div>
      </section>
    </>
  );
}
