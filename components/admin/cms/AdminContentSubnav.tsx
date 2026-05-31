import Link from "next/link";

const LINKS = [
  { href: "/admin/content", label: "فهرس المحتوى" },
  { href: "/admin/content/header", label: "الهيدر" },
  { href: "/admin/content/marquee", label: "الشريط المتحرك" },
  { href: "/admin/content/banners", label: "البنرات" },
  { href: "/admin/content/home", label: "الصفحة الرئيسية" },
  { href: "/admin/content/footer", label: "الفوتر" },
  { href: "/admin/content/campaign", label: "صفحات الحملة" },
] as const;

export function AdminContentSubnav({ active }: { active: string }) {
  return (
    <nav className="mb-6 flex flex-wrap gap-2 border-b border-brand-gray pb-4">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
            active === link.href
              ? "bg-brand-gold text-brand-navy"
              : "bg-brand-gray/50 text-brand-navy hover:bg-brand-gray"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
