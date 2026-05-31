import { AdminOperationsProductTabs } from "@/components/admin/AdminOperationsProductTabs";
import { AdminSubmissionCard } from "@/components/admin/AdminSubmissionCard";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { isWordPressMediaUploadConfigured } from "@/lib/wp-media-config";

export const metadata = { title: "المنتجات المخفية" };

const submissionInclude = {
  vendor: { select: { username: true } },
} as const;

export default async function AdminHiddenProductsPage() {
  await requireAdmin();

  const [hiddenSubmissions, activeCount] = await Promise.all([
    prisma.productSubmission.findMany({
      where: { adminHidden: true },
      include: submissionInclude,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.productSubmission.count({ where: { adminHidden: false } }),
  ]);

  const wpMediaConfigured = isWordPressMediaUploadConfigured();

  return (
    <AdminShell
      title="المنتجات المخفية"
      subtitle={`${hiddenSubmissions.length} منتج مخفي — يمكنك إظهاره أو مسحه نهائياً`}
    >
      <section>
        <AdminOperationsProductTabs
          activeCount={activeCount}
          hiddenCount={hiddenSubmissions.length}
        />
        {hiddenSubmissions.length === 0 ? (
          <p className="rounded-xl border border-brand-gray bg-brand-white p-6 text-sm text-brand-navy/70">
            لا توجد منتجات مخفية. استخدم «إخفاء المنتج» من قائمة طلبات المنتجات.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {hiddenSubmissions.map((item) => (
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
