import Link from "next/link";
import type { ReactNode } from "react";
import { HeaderAccountLink } from "@/components/HeaderAccountLink";
import { HeaderWalletLink } from "@/components/HeaderWalletLink";
import { SocialIconsList } from "@/components/social/SocialIconsList";
import { WP_STORE_ORIGIN, WP_WISHLIST_URL } from "@/lib/constants";
import type { SocialLinkView } from "@/lib/cms/types";

function iconWrap(
  href: string,
  label: string,
  children: ReactNode,
  external = true,
) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-brand-navy transition hover:bg-brand-gold/20 hover:text-brand-gold"
    >
      {children}
    </Link>
  );
}

function IconUser() {
  return (
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconCart() {
  return (
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
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function IconHeart() {
  return (
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
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

const iconClass =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-brand-navy transition hover:bg-brand-gold/20 hover:text-brand-gold";

type Props = {
  socialLinks: SocialLinkView[];
  showSocial: boolean;
  clickMode: "chooser" | "direct";
};

export function HeaderIconsSocial({
  socialLinks,
  showSocial,
  clickMode,
}: Props) {
  const base = WP_STORE_ORIGIN;

  return (
    <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
      <div className="flex items-center gap-0.5 border-brand-gray ps-2 sm:gap-1 sm:ps-3 md:border-s">
        <HeaderAccountLink className={iconClass}>
          <IconUser />
        </HeaderAccountLink>
        <HeaderWalletLink className={iconClass} />
        <Link
          href="/register"
          aria-label="إنشاء حساب"
          title="إنشاء حساب"
          className={`${iconClass} hidden text-[10px] font-bold sm:flex sm:w-auto sm:px-2`}
        >
          تسجيل
        </Link>
        {iconWrap(`${base}/cart/`, "سلة التسوق", <IconCart />)}
        {iconWrap(`${WP_WISHLIST_URL}`, "المفضلة", <IconHeart />)}
      </div>

      {showSocial && socialLinks.length > 0 ? (
        <SocialIconsList
          links={socialLinks}
          clickMode={clickMode}
          layout="horizontal"
          className="ps-2 sm:ps-4"
        />
      ) : null}
    </div>
  );
}
