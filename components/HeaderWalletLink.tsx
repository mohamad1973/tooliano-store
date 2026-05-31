import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { USER_ROLES } from "@/lib/db/constants";

export async function HeaderWalletLink({ className }: { className?: string }) {
  const session = await getSession();
  if (session?.role !== USER_ROLES.BUYER) return null;

  return (
    <Link
      href="/account/wallet"
      aria-label="المحفظة"
      title="المحفظة"
      className={
        className ??
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-brand-navy transition hover:bg-brand-gold/20 hover:text-brand-gold"
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M19 7V4a1 1 0 0 0-1-1H2" />
        <path d="M20 16v2a1 1 0 0 1-1 1h-2" />
        <path d="M3 19a1 1 0 0 1-1-1v-2" />
        <path d="M3 7h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3z" />
      </svg>
    </Link>
  );
}
