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
  const circleClass =
    size === "md"
      ? "h-9 min-w-9 text-sm"
      : "h-8 min-w-8 text-xs";

  const label = remaining > 99 ? "99+" : String(remaining);

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 ${className}`}
      title={`${remaining} قطعة متبقية`}
      dir="rtl"
    >
      <span className="text-[10px] font-semibold text-brand-navy/75">متبقى</span>
      <span
        className={`inline-flex items-center justify-center rounded-full bg-red-600 px-1.5 font-bold tabular-nums leading-none text-white shadow-sm ring-2 ring-white ${circleClass}`}
      >
        {label}
      </span>
    </span>
  );
}
