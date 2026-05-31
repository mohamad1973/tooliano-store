import type { ReactNode } from "react";
import Link from "next/link";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
};

export function AuthCard({
  title,
  subtitle,
  children,
  backHref = "/register",
  backLabel = "رجوع",
  className = "",
}: AuthCardProps) {
  return (
    <div
      className={`mx-auto w-full max-w-lg rounded-2xl border border-brand-gray bg-brand-white p-6 shadow-lg sm:p-8 ${className}`}
    >
      {backHref ? (
        <Link
          href={backHref}
          className="mb-4 inline-block text-sm text-brand-navy/70 hover:text-brand-gold"
        >
          ← {backLabel}
        </Link>
      ) : null}
      <h1 className="text-xl font-bold text-brand-navy sm:text-2xl">{title}</h1>
      {subtitle ? (
        <p className="mt-2 text-sm text-brand-navy/70">{subtitle}</p>
      ) : null}
      <div className="mt-6">{children}</div>
    </div>
  );
}
