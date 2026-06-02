import { PRODUCT_CONDITION, type ProductCondition } from "@/lib/db/constants";

export type SubmissionProductInput = {
  productName: string;
  productType: string;
  productCondition: ProductCondition;
  productDescription: string;
  specWatts: string | null;
  specVoltage: string | null;
  specCapacity: string | null;
  specPower: string | null;
  specColor: string | null;
  specExtra: string | null;
  outletReason: string | null;
  suggestedQuantity: number;
  suggestedRetailPrice: number | null;
  suggestedGroupPrice: number | null;
  productImageUrl: string | null;
  dealDurationDays: number;
  dealDurationHours: number;
  dealDurationMinutes: number;
};

export function parseSubmissionProductBody(
  body: Record<string, unknown>,
): SubmissionProductInput {
  const productCondition = String(body.productCondition ?? "").trim();
  const condition =
    productCondition === PRODUCT_CONDITION.OUTLET
      ? PRODUCT_CONDITION.OUTLET
      : PRODUCT_CONDITION.NEW;

  return {
    productName: String(body.productName ?? "").trim(),
    productType: String(body.productType ?? "").trim(),
    productCondition: condition,
    productDescription: String(body.productDescription ?? "").trim(),
    specWatts: String(body.specWatts ?? "").trim() || null,
    specVoltage: String(body.specVoltage ?? "").trim() || null,
    specCapacity: String(body.specCapacity ?? "").trim() || null,
    specPower: String(body.specPower ?? "").trim() || null,
    specColor: String(body.specColor ?? "").trim() || null,
    specExtra: String(body.specExtra ?? "").trim() || null,
    outletReason: String(body.outletReason ?? "").trim() || null,
    suggestedQuantity: Number.parseInt(String(body.suggestedQuantity ?? ""), 10),
    suggestedRetailPrice: body.suggestedRetailPrice
      ? Number.parseFloat(String(body.suggestedRetailPrice))
      : null,
    suggestedGroupPrice: body.suggestedGroupPrice
      ? Number.parseFloat(String(body.suggestedGroupPrice))
      : null,
    productImageUrl: String(body.productImageUrl ?? "").trim() || null,
    dealDurationDays: Number.parseInt(String(body.dealDurationDays ?? "0"), 10),
    dealDurationHours: Number.parseInt(
      String(body.dealDurationHours ?? "0"),
      10,
    ),
    dealDurationMinutes: Number.parseInt(
      String(body.dealDurationMinutes ?? "0"),
      10,
    ),
  };
}

export type ProductSpecRow = { label: string; value: string };

export function buildSpecRows(
  data: Pick<
    SubmissionProductInput,
    | "specWatts"
    | "specVoltage"
    | "specCapacity"
    | "specPower"
    | "specColor"
    | "specExtra"
  >,
): ProductSpecRow[] {
  const rows: ProductSpecRow[] = [];
  if (data.specWatts) rows.push({ label: "القدرة (واط)", value: data.specWatts });
  if (data.specVoltage) rows.push({ label: "الفولت", value: data.specVoltage });
  if (data.specCapacity) rows.push({ label: "السعة", value: data.specCapacity });
  if (data.specPower) rows.push({ label: "القدرة", value: data.specPower });
  if (data.specColor) rows.push({ label: "اللون", value: data.specColor });
  if (data.specExtra) rows.push({ label: "مواصفات إضافية", value: data.specExtra });
  return rows;
}

export function countFilledSpecs(
  data: Pick<
    SubmissionProductInput,
    | "specWatts"
    | "specVoltage"
    | "specCapacity"
    | "specPower"
    | "specColor"
    | "specExtra"
  >,
): number {
  return [
    data.specWatts,
    data.specVoltage,
    data.specCapacity,
    data.specPower,
    data.specColor,
    data.specExtra,
  ].filter((v) => v?.trim()).length;
}
