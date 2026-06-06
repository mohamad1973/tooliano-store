import Link from "next/link";
import { AdminContentSubnav } from "@/components/admin/cms/AdminContentSubnav";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guards";

const SECTIONS = [
  {
    href: "/admin/content/header",
    title: "الهيدر والشعار",
    desc: "اسم الموقع، الشعار الفرعي، صورة الشعار، إظهار الماركوي",
  },
  {
    href: "/admin/content/menu",
    title: "قائمة الأقسام",
    desc: "منيو الهيدر — إضافة، حذف، سحب وإفلات",
  },
  {
    href: "/admin/content/marquee",
    title: "الشريط المتحرك",
    desc: "عبارات أعلى الموقع",
  },
  {
    href: "/admin/content/banners",
    title: "بنرات التصنيفات",
    desc: "صور الصفحة الرئيسية وربطها بتصنيفات WooCommerce",
  },
  {
    href: "/admin/content/home",
    title: "أقسام الصفحة الرئيسية",
    desc: "ترتيب وإظهار الأقسام (بنرات، شراء جماعي)",
  },
  {
    href: "/admin/content/pages/home",
    title: "كتل الصفحة الرئيسية",
    desc: "بانر، نص غني، أزرار — سحب وإفلات",
  },
  {
    href: "/admin/content/theme",
    title: "ألوان الثيم",
    desc: "ذهبي، كحلي، خلفية، نص",
  },
  {
    href: "/admin/content/footer",
    title: "الفوتر",
    desc: "أعمدة وروابط أسفل الموقع",
  },
  {
    href: "/admin/content/social",
    title: "وسائل التواصل",
    desc: "أيقونات السوشيال، الروابط، الهيدر/الفوتر/الجانب",
  },
  {
    href: "/admin/content/mobile",
    title: "الموبايل",
    desc: "burger drawer، سوشيال الموبايل، بنرات/أقسام، فوتر مضغوط",
  },
  {
    href: "/admin/content/campaign",
    title: "صفحات الحملة",
    desc: "FAQ، كيف يعمل، سياسة المحفظة",
  },
] as const;

export const metadata = { title: "محتوى الموقع" };

export default async function AdminContentIndexPage() {
  await requireAdmin();

  return (
    <AdminShell
      title="محتوى الموقع"
      subtitle="تحرير واجهة المتجر — الهيدر، البنرات، الفوتر، ونصوص الحملة"
    >
      <AdminContentSubnav active="/admin/content" />
      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-xl border border-brand-gray bg-brand-white p-5 transition hover:border-brand-gold hover:shadow-md"
          >
            <h2 className="font-bold text-brand-navy">{s.title}</h2>
            <p className="mt-1 text-sm text-brand-navy/70">{s.desc}</p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
