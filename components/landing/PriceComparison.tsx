import { formatCurrency } from "@/lib/format";
import { getSavingsPercent } from "@/lib/campaign-config";

type Props = {
  retailPrice: number;
  groupPrice: number;
  targetQuantity: number;
};

export function PriceComparison({
  retailPrice,
  groupPrice,
  targetQuantity,
}: Props) {
  const savings = getSavingsPercent(retailPrice, groupPrice);

  return (
    <div className="rounded-2xl border border-brand-gray bg-brand-white p-5 shadow-sm sm:p-6">
      <p className="mb-4 text-center text-sm font-semibold text-brand-navy/70">
        قارن الأسعار
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-brand-gray bg-brand-gray/40 p-4 text-center">
          <p className="text-xs font-medium text-brand-navy/60">سعر القطعة</p>
          <p className="mt-1 text-2xl font-bold text-brand-navy line-through decoration-brand-navy/40">
            {formatCurrency(retailPrice)}
          </p>
        </div>
        <div className="rounded-xl border-2 border-brand-gold bg-brand-gold/10 p-4 text-center">
          <p className="text-xs font-medium text-brand-navy">
            سعر الشراء الجماعي
          </p>
          <p className="mt-1 text-3xl font-bold text-brand-gold">
            {formatCurrency(groupPrice)}
          </p>
          <p className="mt-1 text-xs text-brand-navy/70">
            عند اكتمال {targetQuantity} قطعة
          </p>
        </div>
      </div>
      {savings > 0 ? (
        <p className="mt-4 text-center text-sm font-bold text-brand-gold">
          وفّر {savings}% مع اكتمال الحملة
        </p>
      ) : null}
    </div>
  );
}
