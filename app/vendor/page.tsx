import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { VendorProductForm } from "@/components/vendor/VendorProductForm";
import { VendorSubmissionEditForm } from "@/components/vendor/VendorSubmissionEditForm";
import { APPROVAL_STATUS } from "@/lib/db/constants";
import {
  productConditionBadgeClass,
  productConditionLabel,
} from "@/lib/product-condition-labels";
import { requireVendor } from "@/lib/auth/guards";
import {
  approvalStatusClass,
  approvalStatusLabel,
  businessTypeLabel,
} from "@/lib/approval-labels";
import { prisma } from "@/lib/db/prisma";
import { getVendorOrderSummaries } from "@/lib/vendor/submission-orders";
import { orderStatusLabel } from "@/lib/orders/labels";

export const metadata = {
  title: "لوحة البائع",
};

export default async function VendorDashboardPage() {
  const session = await requireVendor();

  const [profile, submissions, campaignOrders] = await Promise.all([
    prisma.vendorProfile.findUnique({ where: { userId: session.userId } }),
    prisma.productSubmission.findMany({
      where: { vendorId: session.userId },
      orderBy: { createdAt: "desc" },
    }),
    getVendorOrderSummaries(session.userId),
  ]);

  return (
    <DashboardShell
      title="لوحة البائع"
      subtitle={`مرحباً، ${session.username}`}
    >
      {profile ? (
        <section className="mb-8 rounded-2xl border border-brand-gray p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-brand-navy">الملف التجاري</h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${approvalStatusClass(profile.status)}`}
            >
              {approvalStatusLabel(profile.status)}
            </span>
          </div>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-brand-navy/60">الشركة</dt>
              <dd className="font-medium">{profile.companyName}</dd>
            </div>
            <div>
              <dt className="text-brand-navy/60">المسؤول</dt>
              <dd className="font-medium">{profile.contactName}</dd>
            </div>
            <div>
              <dt className="text-brand-navy/60">الهاتف</dt>
              <dd className="font-medium" dir="ltr">
                {profile.phone}
              </dd>
            </div>
            <div>
              <dt className="text-brand-navy/60">البريد</dt>
              <dd className="font-medium">{profile.contactEmail}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-brand-navy/60">العنوان</dt>
              <dd className="font-medium">{profile.address}</dd>
            </div>
            <div>
              <dt className="text-brand-navy/60">نوع النشاط</dt>
              <dd className="font-medium">
                {businessTypeLabel(profile.businessType)}
              </dd>
            </div>
            <div>
              <dt className="text-brand-navy/60">حجم العمالة</dt>
              <dd className="font-medium">{profile.teamSize} موظف</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-brand-navy/60">أنواع المنتجات</dt>
              <dd className="font-medium">{profile.productTypesDescription}</dd>
            </div>
          </dl>
          {profile.adminNote ? (
            <p className="mt-4 rounded-lg bg-brand-gray/40 px-3 py-2 text-sm">
              <span className="font-semibold">ملاحظة الإدارة: </span>
              {profile.adminNote}
            </p>
          ) : null}
        </section>
      ) : null}

      <section>
        <h2 className="text-lg font-bold text-brand-navy">منتجاتك المُرسلة</h2>
        {submissions.length === 0 ? (
          <p className="mt-2 text-sm text-brand-navy/60">لا توجد منتجات بعد.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {submissions.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-brand-gray p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-brand-navy">{item.productName}</h3>
                    <p className="text-xs text-brand-navy/60">{item.productType}</p>
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
                {item.status === APPROVAL_STATUS.APPROVED ? (
                  <Link
                    href={`/campaign/offer/${item.id}`}
                    className="mt-2 inline-block text-xs font-semibold text-brand-gold hover:underline"
                  >
                    عرض الصفحة العامة للحملة ←
                  </Link>
                ) : null}
                <p className="mt-2 text-sm text-brand-navy/80 line-clamp-3">
                  {item.productDescription}
                </p>
                <p className="mt-2 text-xs text-brand-navy/60">
                  كمية مقترحة: {item.suggestedQuantity}
                  {item.suggestedRetailPrice != null
                    ? ` · فردي: ${item.suggestedRetailPrice} ج.م`
                    : ""}
                  {item.suggestedGroupPrice != null
                    ? ` · جماعي: ${item.suggestedGroupPrice} ج.م`
                    : ""}
                </p>
                {item.adminNote &&
                item.status !== APPROVAL_STATUS.NEEDS_REVISION ? (
                  <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    ملاحظة الإدارة: {item.adminNote}
                  </p>
                ) : null}
                {item.status === APPROVAL_STATUS.NEEDS_REVISION ? (
                  <VendorSubmissionEditForm submission={item} />
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {campaignOrders.length > 0 ? (
          <section className="mb-8">
            <h3 className="mb-3 text-base font-bold text-brand-navy">
              طلبات الشراء الجماعي (بدون مبالغ)
            </h3>
            <ul className="space-y-3">
              {campaignOrders.map((c) => (
                <li
                  key={c.id}
                  className="rounded-xl border border-brand-gray p-3 text-sm"
                >
                  <p className="font-semibold">{c.productName}</p>
                  <p className="text-brand-navy/60">
                    محجوز {c.reservedQuantity} / {c.targetQuantity} —{" "}
                    {c.campaignOutcome}
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-brand-navy/70">
                    {c.orders.map((o) => (
                      <li key={o.id}>
                        كمية {o.quantity} — {orderStatusLabel(o.status)}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <VendorProductForm />
      </section>
    </DashboardShell>
  );
}
