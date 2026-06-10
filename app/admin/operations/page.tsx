import Link from "next/link";
import { AdminOperationsProductTabs } from "@/components/admin/AdminOperationsProductTabs";
import { AdminReviewActions } from "@/components/admin/AdminReviewActions";
import { AdminSubmissionCard } from "@/components/admin/AdminSubmissionCard";
import { PersistProductImagesPanel } from "@/components/admin/PersistProductImagesPanel";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guards";
import {
  approvalStatusClass,
  approvalStatusLabel,
  businessTypeLabel,
} from "@/lib/approval-labels";
import { prisma } from "@/lib/db/prisma";
import { CampaignDecisionActions } from "@/components/campaign/CampaignDecisionActions";
import { CampaignStatusBadge } from "@/components/campaign/CampaignStatusBadge";
import { awaitingDecisionWhere } from "@/lib/campaign/awaiting-query";
import { isWordPressMediaUploadConfigured } from "@/lib/wp-media-config";

export const metadata = { title: "عمليات الإدارة" };

const submissionInclude = {
  vendor: { select: { username: true } },
} as const;

export default async function AdminOperationsPage() {
  await requireAdmin();

  const [vendors, activeSubmissions, awaitingSubmissions, hiddenCount] =
    await Promise.all([
    prisma.vendorProfile.findMany({
      include: { user: { select: { username: true, id: true, createdAt: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.productSubmission.findMany({
      where: { adminHidden: false },
      include: submissionInclude,
      orderBy: { createdAt: "desc" },
    }),
    prisma.productSubmission.findMany({
      where: awaitingDecisionWhere(),
      include: submissionInclude,
      orderBy: { campaignEndsAt: "asc" },
    }),
    prisma.productSubmission.count({ where: { adminHidden: true } }),
  ]);

  const pendingVendors = vendors.filter((v) => v.status === "PENDING").length;
  const pendingProducts = activeSubmissions.filter((s) => s.status === "PENDING")
    .length;

  const wpMediaConfigured = isWordPressMediaUploadConfigured();

  return (
    <AdminShell
      title="العمليات"
      subtitle={`${pendingVendors} تاجر قيد المراجعة · ${pendingProducts} منتج قيد المراجعة`}
    >
      <PersistProductImagesPanel wpMediaConfigured={wpMediaConfigured} />

      {awaitingSubmissions.length > 0 ? (
        <section className="mb-10" id="awaiting-decision">
          <h2 className="mb-4 text-lg font-bold text-brand-navy">
            عروض منتهية بانتظار قرار ({awaitingSubmissions.length})
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {awaitingSubmissions.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-amber-300 bg-amber-50/40 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-brand-navy">
                      {item.productName}
                    </h3>
                    <p className="text-xs text-brand-navy/60">
                      @{item.vendor.username}
                    </p>
                  </div>
                  <CampaignStatusBadge status="AWAITING_DECISION" />
                </div>
                <p className="mt-2 text-sm text-brand-navy/80">
                  محجوز {item.reservedQuantity} / {item.suggestedQuantity}
                </p>
                <CampaignDecisionActions
                  submissionId={item.id}
                  productName={item.productName}
                  apiEndpoint={`/api/admin/submissions/${item.id}/campaign-decision`}
                />
              </article>
            ))}
          </div>
        </section>
      ) : null}

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
        <h2 className="mb-2 text-lg font-bold text-brand-navy">
          طلبات المنتجات
        </h2>
        <AdminOperationsProductTabs
          activeCount={activeSubmissions.length}
          hiddenCount={hiddenCount}
        />
        {activeSubmissions.length === 0 ? (
          <p className="rounded-xl border border-brand-gray bg-brand-white p-6 text-sm text-brand-navy/70">
            لا توجد منتجات في القائمة النشطة. راجع «المنتجات المخفية» إن كنت
            أخفيت منتجاتاً سابقاً.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {activeSubmissions.map((item) => (
              <AdminSubmissionCard
                key={item.id}
                item={item}
                wpMediaConfigured={wpMediaConfigured}
              />
            ))}
          </div>
        )}
      </section>
    </AdminShell>
  );
}
