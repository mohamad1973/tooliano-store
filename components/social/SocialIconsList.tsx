"use client";

import { SocialIconButton } from "@/components/social/SocialIconButton";
import type { SocialLinkView } from "@/lib/cms/types";

type Props = {
  links: SocialLinkView[];
  clickMode: "chooser" | "direct";
  layout?: "horizontal" | "vertical";
  className?: string;
  buttonClassName?: string;
  onDark?: boolean;
  ariaLabel?: string;
};

export function SocialIconsList({
  links,
  clickMode,
  layout = "horizontal",
  className = "",
  buttonClassName,
  onDark = false,
  ariaLabel = "وسائل التواصل",
}: Props) {
  if (links.length === 0) return null;

  const layoutClass =
    layout === "vertical"
      ? "flex flex-col items-center gap-2"
      : "flex items-center gap-0.5 sm:gap-1";

  return (
    <div className={`${layoutClass} ${className}`} aria-label={ariaLabel}>
      {links.map((link) => (
        <SocialIconButton
          key={link.id}
          link={link}
          clickMode={clickMode}
          buttonClassName={buttonClassName}
          onDark={onDark}
        />
      ))}
    </div>
  );
}
