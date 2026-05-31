export type AdminNavItem = {
  href: string;
  label: string;
  description?: string;
  phase?: 1 | 2;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "الملخص", description: "أرقام سريعة" },
  { href: "/admin/users", label: "المستخدمون", description: "أدمن، تاجر، مشتري، مندوب" },
  { href: "/admin/payments", label: "المدفوعات", description: "محافظ وأرباح" },
  { href: "/admin/operations", label: "العمليات", description: "موافقة تجار ومنتجات" },
  { href: "/admin/delivery", label: "التسليم", description: "مندوبون وطلبات" },
  {
    href: "/admin/content",
    label: "محتوى الموقع",
    description: "مرحلة ٢ — قريباً",
    phase: 2,
  },
];
