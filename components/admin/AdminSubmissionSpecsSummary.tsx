import {
  productConditionBadgeClass,
  productConditionLabel,
} from "@/lib/product-condition-labels";
import { buildSpecRows } from "@/lib/submission-product-fields";
import { PRODUCT_CONDITION } from "@/lib/db/constants";

type Props = {
  productCondition: string;
  productType: string;
  specWatts: string | null;
  specVoltage: string | null;
  specCapacity: string | null;
  specPower: string | null;
  specColor: string | null;
  specExtra: string | null;
  outletReason: string | null;
  productDescription: string;
};

export function AdminSubmissionSpecsSummary({
  productCondition,
  productType,
  specWatts,
  specVoltage,
  specCapacity,
  specPower,
  specColor,
  specExtra,
  outletReason,
  productDescription,
}: Props) {
  const rows = buildSpecRows({
    specWatts,
    specVoltage,
    specCapacity,
    specPower,
    specColor,
    specExtra,
  });

  return (
    <div className="mt-3 space-y-2 text-sm">
      <div className="flex flex-wrap gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${productConditionBadgeClass(productCondition)}`}
        >
          {productConditionLabel(productCondition)}
        </span>
        <span className="text-xs text-brand-navy/60">نوع: {productType}</span>
      </div>
      {rows.length > 0 ? (
        <dl className="grid gap-1 rounded-lg bg-brand-gray/30 p-3 text-xs sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label}>
              <span className="text-brand-navy/60">{r.label}: </span>
              <span className="font-medium">{r.value}</span>
            </div>
          ))}
        </dl>
      ) : null}
      {productCondition === PRODUCT_CONDITION.OUTLET && outletReason ? (
        <p className="rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-900">
          <span className="font-semibold">سبب الأوت ليت: </span>
          {outletReason}
        </p>
      ) : null}
      {productDescription?.trim() ? (
        <p className="text-xs text-brand-navy/70">
          <span className="font-semibold">نبذة: </span>
          {productDescription}
        </p>
      ) : null}
    </div>
  );
}
