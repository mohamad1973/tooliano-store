import Link from "next/link";
import { AdminReviewActions } from "@/components/admin/AdminReviewActions";
import { AdminSubmissionImagePreview } from "@/components/admin/AdminSubmissionImagePreview";
import { AdminSubmissionSpecsSummary } from "@/components/admin/AdminSubmissionSpecsSummary";
import {
  productConditionBadgeClass,
  productConditionLabel,
} from "@/lib/product-condition-labels";
import { APPROVAL_STATUS } from "@/lib/db/constants";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { isWordPressMediaUploadConfigured } from "@/lib/wp-media-config";
import { requireAdmin } from "@/lib/auth/guards";
import {
  approvalStatusClass,
  approvalStatusLabel,
  businessTypeLabel,
} from "@/lib/approval-labels";
import { prisma } from "@/lib/db/prisma";

export const metadata = {
  title: "لوحة الإدارة",
};

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  const [vendors, submissions] = await Promise.all([
    prisma.vendorProfile.findMany({
      include: { user: { select: { username: true, createdAt: true } } },
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
    <DashboardShell
      title="لوحة الإدارة"
      subtitle={`مرحباً ${session.username} · ${pendingVendors} تاجر قيد المراجعة · ${pendingProducts} منتج قيد المراجعة`}
    >
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold text-brand-navy">
          طلبات التجار ({vendors.length})
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {vendors.map((vendor) => (
            <article
              key={vendor.id}
              className="rounded-2xl border border-brand-gray p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-brand-navy">
                    {vendor.companyName}
                  </h3>
                  <p className="text-xs text-brand-navy/60">
                    @{vendor.user.username}
                  </p>
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
                <div dir="ltr" className="text-end sm:text-start">
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
                <div>
                  <span className="text-brand-navy/60">عنوان: </span>
                  {vendor.address}
                </div>
                <div>
                  <span className="text-brand-navy/60">منتجات: </span>
                  {vendor.productTypesDescription}
                </div>
              </dl>
              {vendor.adminNote ? (
                <p className="mt-2 text-xs text-brand-navy/70">
                  ملاحظة سابقة: {vendor.adminNote}
                </p>
              ) : null}
              <AdminReviewActions
                kind="vendor"
                id={vendor.userId}
                currentStatus={vendor.status}
              />
            </article>
          ))}
        </div>
        {vendors.length === 0 ? (
          <p className="text-sm text-brand-navy/60">لا يوجد تجار مسجلون بعد.</p>
        ) : null}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-brand-navy">
          طلبات المنتجات ({submissions.length})
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {submissions.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-brand-gray p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-brand-navy">{item.productName}</h3>
                  <p className="text-xs text-brand-navy/60">
                    @{item.vendor.username}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${approvalStatusClass(item.status)}`}
                  >
                    {approvalStatusLabel(item.status)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${productConditionBadgeClass(item.productCondition)}`}
                  >
                    {productConditionLabel(item.productCondition)}
                  </span>
                </div>
              </div>
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
                {item.suggestedRetailPrice != null
                  ? ` · فردي ${item.suggestedRetailPrice}`
                  : ""}
                {item.suggestedGroupPrice != null
                  ? ` · جماعي ${item.suggestedGroupPrice}`
                  : ""}
              </p>
              {item.productImageUrl ? (
                <AdminSubmissionImagePreview
                  url={item.productImageUrl}
                  alt={item.productName}
                />
              ) : (
                <p className="mt-2 text-xs text-red-600">⚠ لا توجد صورة</p>
              )}
              {item.status === APPROVAL_STATUS.APPROVED && item.campaignEndsAt ? (
                <p className="mt-2 text-xs text-emerald-800">
                  {item.publishedOnStore ? "معروض في الموقع" : "غير معروض"}
                  {" · "}حملة حتى:{" "}
                  {new Date(item.campaignEndsAt).toLocaleDateString("ar-EG")}
                  {item.wooProductId
                    ? ` · WooCommerce #${item.wooProductId}`
                    : item.wooSyncStatus === "failed"
                      ? " · فشل نشر WP"
                      : ""}
                  {" · "}
                  <Link
                    href={`/campaign/offer/${item.id}`}
                    className="font-semibold text-brand-gold hover:underline"
                  >
                    معاينة العرض
                  </Link>
                </p>
              ) : null}
              {item.wooSyncError && !item.wooProductId ? (
                <p className="mt-1 text-xs text-red-600">{item.wooSyncError}</p>
              ) : null}
              {item.adminNote ? (
                <p className="mt-2 text-xs text-brand-navy/70">
                  ملاحظة سابقة: {item.adminNote}
                </p>
              ) : null}
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
        {submissions.length === 0 ? (
          <p className="text-sm text-brand-navy/60">لا توجد منتجات مُرسلة.</p>
        ) : null}
      </section>
    </DashboardShell>
  );
}
