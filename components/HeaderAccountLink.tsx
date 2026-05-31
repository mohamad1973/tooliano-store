import Link from "next/link";
import type { ReactNode } from "react";
import { getSession } from "@/lib/auth/session";
import { USER_ROLES } from "@/lib/db/constants";

export async function HeaderAccountLink({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const session = await getSession();
  let href = "/login";
  let label = "تسجيل الدخول";

  if (session?.role === USER_ROLES.ADMIN) {
    href = "/admin";
    label = "لوحة الإدارة";
  } else if (session?.role === USER_ROLES.VENDOR) {
    href = "/vendor";
    label = "لوحة البائع";
  } else if (session?.role === USER_ROLES.BUYER) {
    href = "/account";
    label = "حسابي";
  } else if (session?.role === USER_ROLES.DELIVERY_AGENT) {
    href = "/delivery";
    label = "تسليم";
  }

  return (
    <Link href={href} aria-label={label} title={label} className={className}>
      {children}
    </Link>
  );
}
