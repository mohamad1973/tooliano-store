import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata = { title: "محتوى الموقع" };

export default async function AdminContentPlaceholderPage() {
  await requireAdmin();

  return (
    <AdminShell
      title="محتوى الموقع"
      subtitle="المرحلة ٢ — تحرير الهيدر والبنرات والفوتر"
    >
      <p className="rounded-xl border border-dashed border-brand-gold bg-brand-gold/10 p-6 text-sm text-brand-navy">
        هذا القسم مُجهَّز في القائمة الجانبية للمرحلة القادمة: ماركوي، شعار، بنرات، أقسام
        الصفحة الرئيسية، فوتر، ونصوص الحملة. راجع{" "}
        <code className="text-xs">docs/ADMIN-CMS-PHASE2.md</code> عند التفعيل.
      </p>
    </AdminShell>
  );
}
