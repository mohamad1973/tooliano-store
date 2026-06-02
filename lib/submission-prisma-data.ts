import type { Prisma } from "@prisma/client";
import { clampBoostQuantity } from "@/lib/campaign-display-quantity";
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
    dealDurationDays:
      Number.isFinite(input.dealDurationDays) && input.dealDurationDays >= 0
        ? input.dealDurationDays
        : 0,
    dealDurationHours:
      Number.isFinite(input.dealDurationHours) &&
      input.dealDurationHours >= 0 &&
      input.dealDurationHours <= 23
        ? input.dealDurationHours
        : 0,
    dealDurationMinutes:
      Number.isFinite(input.dealDurationMinutes) &&
      input.dealDurationMinutes >= 0 &&
      input.dealDurationMinutes <= 59
        ? input.dealDurationMinutes
        : 0,
    boostReservedQuantity: clampBoostQuantity(
      input.suggestedQuantity,
      input.boostReservedQuantity,
    ),
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
    dealDurationDays:
      Number.isFinite(input.dealDurationDays) && input.dealDurationDays >= 0
        ? input.dealDurationDays
        : 0,
    dealDurationHours:
      Number.isFinite(input.dealDurationHours) &&
      input.dealDurationHours >= 0 &&
      input.dealDurationHours <= 23
        ? input.dealDurationHours
        : 0,
    dealDurationMinutes:
      Number.isFinite(input.dealDurationMinutes) &&
      input.dealDurationMinutes >= 0 &&
      input.dealDurationMinutes <= 59
        ? input.dealDurationMinutes
        : 0,
    boostReservedQuantity: clampBoostQuantity(
      input.suggestedQuantity,
      input.boostReservedQuantity,
    ),
  };
}
