import { PRODUCT_CONDITION } from "@/lib/db/constants";
import {
  productConditionBadgeClass,
  productConditionLabel,
} from "@/lib/product-condition-labels";
import { buildSpecRows, type ProductSpecRow } from "@/lib/submission-product-fields";

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
  productDescription?: string | null;
};

export function ProductSpecsSection({
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
  const rows: ProductSpecRow[] = buildSpecRows({
    specWatts,
    specVoltage,
    specCapacity,
    specPower,
    specColor,
    specExtra,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${productConditionBadgeClass(productCondition)}`}
        >
          {productConditionLabel(productCondition)}
        </span>
        <span className="rounded-full bg-brand-gray/50 px-3 py-1 text-xs text-brand-navy/70">
          {productType}
        </span>
      </div>

      {productCondition === PRODUCT_CONDITION.OUTLET && outletReason ? (
        <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-4">
          <h3 className="text-sm font-bold text-orange-900">سبب الأوت ليت</h3>
          <p className="mt-2 text-sm leading-relaxed text-orange-950">
            {outletReason}
          </p>
        </div>
      ) : null}

      {rows.length > 0 ? (
        <div>
          <h3 className="mb-3 text-lg font-bold text-brand-navy">المواصفات</h3>
          <dl className="divide-y divide-brand-gray rounded-xl border border-brand-gray bg-brand-white">
            {rows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-2 gap-2 px-4 py-3 text-sm sm:grid-cols-3"
              >
                <dt className="font-medium text-brand-navy/70">{row.label}</dt>
                <dd className="col-span-1 text-brand-navy sm:col-span-2">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      {productDescription?.trim() ? (
        <div>
          <h3 className="mb-2 text-base font-bold text-brand-navy">نبذة</h3>
          <p className="text-sm leading-relaxed text-brand-navy/80">
            {productDescription}
          </p>
        </div>
      ) : null}
    </div>
  );
}
