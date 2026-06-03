/** شارة عدد — أسلوب واتساب بلون أخضر يلائم ثيم Tooliano */
export function WhatsAppCountBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  const label = count > 99 ? "99+" : String(count);

  return (
    <span
      className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-brand-white"
      aria-hidden
    >
      {label}
    </span>
  );
}
