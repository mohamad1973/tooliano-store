type Props = {
  remaining: number;
  size?: "sm" | "md";
  className?: string;
};

export function RemainingCountBadge({
  remaining,
  size = "sm",
  className = "",
}: Props) {
  const sizeClass =
    size === "md"
      ? "h-12 w-12 text-base"
      : "h-10 w-10 text-sm";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border-2 border-brand-gold bg-brand-navy font-bold tabular-nums text-brand-gold shadow-md transition-all duration-300 ${sizeClass} ${className}`}
      title={`${remaining} قطعة متبقية`}
    >
      {remaining}
    </span>
  );
}
