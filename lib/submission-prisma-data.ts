import type { Prisma } from "@prisma/client";
import type { SubmissionProductInput } from "@/lib/submission-product-fields";

export function toSubmissionCreateData(
  vendorId: string,
  input: SubmissionProductInput,
  extra?: Partial<Prisma.ProductSubmissionCreateInput>,
): Prisma.ProductSubmissionCreateInput {
  return {
    vendor: { connect: { id: vendorId } },
    productName: input.productName,
    productType: input.productType,
    productCondition: input.productCondition,
    productDescription: input.productDescription,
    specWatts: input.specWatts,
    specVoltage: input.specVoltage,
    specCapacity: input.specCapacity,
    specPower: input.specPower,
    specColor: input.specColor,
    specExtra: input.specExtra,
    outletReason: input.outletReason,
    suggestedQuantity: input.suggestedQuantity,
    suggestedRetailPrice:
      input.suggestedRetailPrice != null &&
      Number.isFinite(input.suggestedRetailPrice)
        ? input.suggestedRetailPrice
        : null,
    suggestedGroupPrice:
      input.suggestedGroupPrice != null &&
      Number.isFinite(input.suggestedGroupPrice)
        ? input.suggestedGroupPrice
        : null,
    productImageUrl: input.productImageUrl,
    ...extra,
  };
}

export function toSubmissionUpdateData(
  input: SubmissionProductInput,
): Prisma.ProductSubmissionUpdateInput {
  return {
    productName: input.productName,
    productType: input.productType,
    productCondition: input.productCondition,
    productDescription: input.productDescription,
    specWatts: input.specWatts,
    specVoltage: input.specVoltage,
    specCapacity: input.specCapacity,
    specPower: input.specPower,
    specColor: input.specColor,
    specExtra: input.specExtra,
    outletReason: input.outletReason,
    suggestedQuantity: input.suggestedQuantity,
    suggestedRetailPrice:
      input.suggestedRetailPrice != null &&
      Number.isFinite(input.suggestedRetailPrice)
        ? input.suggestedRetailPrice
        : null,
    suggestedGroupPrice:
      input.suggestedGroupPrice != null &&
      Number.isFinite(input.suggestedGroupPrice)
        ? input.suggestedGroupPrice
        : null,
    productImageUrl: input.productImageUrl,
  };
}
