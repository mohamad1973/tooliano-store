export type AdminNavItem = {
  href: string;
  label: string;
  description?: string;
  phase?: 1 | 2;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", description: "Quick overview" },
  { href: "/admin/users", label: "Users", description: "Admins, vendors, buyers" },
  { href: "/admin/payments", label: "Payments", description: "Wallets and revenue" },
  { href: "/admin/operations", label: "Operations", description: "Reviews and approvals" },
  { href: "/admin/delivery", label: "Delivery", description: "Agents and orders" },
  {
    href: "/admin/content",
    label: "Appearance",
    description: "Header, banners, footer",
  },
];
