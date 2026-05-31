import Link from "next/link";
import { AdminSubmissionEditForm } from "@/components/admin/AdminSubmissionEditForm";
import { AdminReviewActions } from "@/components/admin/AdminReviewActions";
import { AdminSubmissionImagePreview } from "@/components/admin/AdminSubmissionImagePreview";
import { PersistProductImagesPanel } from "@/components/admin/PersistProductImagesPanel";
import { getSubmissionImageUrlForAdmin } from "@/lib/submission-image-persist";
import { AdminSubmissionSpecsSummary } from "@/components/admin/AdminSubmissionSpecsSummary";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  productConditionBadgeClass,
  productConditionLabel,
} from "@/lib/product-condition-labels";
import { APPROVAL_STATUS } from "@/lib/db/constants";
import { isWordPressMediaUploadConfigured } from "@/lib/wp-media-config";
import { requireAdmin } from "@/lib/auth/guards";
import {
  approvalStatusClass,
  approvalStatusLabel,
  businessTypeLabel,
} from "@/lib/approval-labels";
import { prisma } from "@/lib/db/prisma";

export const metadata = { title: "عمليات الإدارة" };

export default async function AdminOperationsPage() {
  const session = await requireAdmin();

  const [vendors, submissions] = await Promise.all([
    prisma.vendorProfile.findMany({
      include: { user: { select: { username: true, id: true, createdAt: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.productSubmission.findMany({
      include: { vendor: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const pendingVendors = vendors.filter((v) => v.status === "PENDING").length;
  const pendingProducts = submissions.filter((s) => s.status === "PENDING")
    .length;

  const wpMediaConfigured = isWordPressMediaUploadConfigured();

  return (
    <AdminShell
      title="العمليات"
      subtitle={`${pendingVendors} تاجر قيد المراجعة · ${pendingProducts} منتج قيد المراجعة`}
    >
      <PersistProductImagesPanel wpMediaConfigured={wpMediaConfigured} />
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold text-brand-navy">
          طلبات التجار ({vendors.length})
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {vendors.map((vendor) => (
            <article
              key={vendor.id}
              className="rounded-2xl border border-brand-gray bg-brand-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-brand-navy">
                    {vendor.companyName}
                  </h3>
                  <Link
                    href={`/admin/users/vendors/${vendor.userId}`}
                    className="text-xs font-semibold text-brand-gold hover:underline"
                  >
                    @{vendor.user.username}
                  </Link>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${approvalStatusClass(vendor.status)}`}
                >
                  {approvalStatusLabel(vendor.status)}
                </span>
              </div>
              <dl className="mt-3 space-y-1 text-sm">
                <div>
                  <span className="text-brand-navy/60">المسؤول: </span>
                  {vendor.contactName}
                </div>
                <div dir="ltr" className="text-end">
                  <span className="text-brand-navy/60">هاتف: </span>
                  {vendor.phone}
                </div>
                <div>
                  <span className="text-brand-navy/60">بريد: </span>
                  {vendor.contactEmail}
                </div>
                <div>
                  <span className="text-brand-navy/60">نشاط: </span>
                  {businessTypeLabel(vendor.businessType)} · {vendor.teamSize}{" "}
                  موظف
                </div>
              </dl>
              <AdminReviewActions
                kind="vendor"
                id={vendor.userId}
                currentStatus={vendor.status}
              />
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-brand-navy">
          طلبات المنتجات ({submissions.length})
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {submissions.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-brand-gray bg-brand-white p-4"
            >
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
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
