import Link from "next/link";
import { AdminSubmissionEditForm } from "@/components/admin/AdminSubmissionEditForm";
import { AdminReviewActions } from "@/components/admin/AdminReviewActions";
import { AdminSubmissionActions } from "@/components/admin/AdminSubmissionActions";
import { AdminSubmissionImagePreview } from "@/components/admin/AdminSubmissionImagePreview";
import { AdminSubmissionSpecsSummary } from "@/components/admin/AdminSubmissionSpecsSummary";
import { APPROVAL_STATUS } from "@/lib/db/constants";
import { getSubmissionImageUrlForAdmin } from "@/lib/submission-image-persist";

export type AdminSubmissionCardData = {
  id: string;
  productName: string;
  productType: string;
  productCondition: string;
  productDescription: string;
  specWatts: string | null;
  specVoltage: string | null;
  specCapacity: string | null;
  specPower: string | null;
  specColor: string | null;
  specExtra: string | null;
  outletReason: string | null;
  suggestedQuantity: number;
  suggestedRetailPrice: number | null;
  suggestedGroupPrice: number | null;
  dealDurationDays: number;
  dealDurationHours: number;
  dealDurationMinutes: number;
  vendorSettlementUnitPrice: number | null;
  productImageUrl: string | null;
  status: string;
  adminHidden: boolean;
  campaignEndsAt: Date | null;
  wooProductId: number | null;
  wooSyncStatus: string;
  wooSyncError: string | null;
  publishedOnStore: boolean;
  vendor: { username: string };
};

export function AdminSubmissionCard({
  item,
  wpMediaConfigured,
}: {
  item: AdminSubmissionCardData;
  wpMediaConfigured: boolean;
}) {
  return (
    <article className="rounded-2xl border border-brand-gray bg-brand-white p-4">
      <h3 className="font-bold text-brand-navy">{item.productName}</h3>
      <p className="text-xs text-brand-navy/60">@{item.vendor.username}</p>
      <AdminSubmissionSpecsSummary
        productCondition={item.productCondition}
        productType={item.productType}
        specWatts={item.specWatts}
        specVoltage={item.specVoltage}
        specCapacity={item.specCapacity}
        specPower={item.specPower}
        specColor={item.specColor}
        specExtra={item.specExtra}
        outletReason={item.outletReason}
        productDescription={item.productDescription}
      />
      <p className="mt-2 text-xs text-brand-navy/60">
        كمية: {item.suggestedQuantity}
        {item.suggestedGroupPrice != null
          ? ` · جماعي ${item.suggestedGroupPrice}`
          : ""}
        {item.vendorSettlementUnitPrice != null
          ? ` · تسوية تاجر ${item.vendorSettlementUnitPrice}`
          : ""}
      </p>
      {item.productImageUrl ? (
        <AdminSubmissionImagePreview
          url={item.productImageUrl}
          displaySrc={getSubmissionImageUrlForAdmin(item.productImageUrl)}
          alt={item.productName}
        />
      ) : null}
      {item.status === APPROVAL_STATUS.APPROVED && item.campaignEndsAt ? (
        <p className="mt-2 text-xs text-emerald-800">
          <Link
            href={`/campaign/offer/${item.id}`}
            className="font-semibold text-brand-gold hover:underline"
          >
            معاينة العرض
          </Link>
        </p>
      ) : null}
      <AdminSubmissionEditForm submission={item} />
      <AdminSubmissionActions
        submissionId={item.id}
        adminHidden={item.adminHidden}
      />
      <AdminReviewActions
        kind="submission"
        id={item.id}
        currentStatus={item.status}
        wooProductId={item.wooProductId}
        wooSyncStatus={item.wooSyncStatus}
        wooSyncError={item.wooSyncError}
        publishedOnStore={item.publishedOnStore}
        wpMediaConfigured={wpMediaConfigured}
      />
    </article>
  );
}
