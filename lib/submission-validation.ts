import type { ProductSubmission } from "@prisma/client";
import { PRODUCT_CONDITION } from "@/lib/db/constants";
import { isValidPublicImageUrl } from "@/lib/image-url";
import { countFilledSpecs } from "@/lib/submission-product-fields";

export type SubmissionValidationIssue = {
  field: string;
  message: string;
};

type SubmissionForValidation = Pick<
  ProductSubmission,
  | "productName"
  | "productType"
  | "productCondition"
  | "productDescription"
  | "specWatts"
  | "specVoltage"
  | "specCapacity"
  | "specPower"
  | "specColor"
  | "specExtra"
  | "outletReason"
  | "suggestedQuantity"
  | "suggestedRetailPrice"
  | "suggestedGroupPrice"
  | "productImageUrl"
>;

export function validateSubmissionForApproval(
  submission: SubmissionForValidation,
): SubmissionValidationIssue[] {
  const issues: SubmissionValidationIssue[] = [];

  if (!submission.productName?.trim()) {
    issues.push({ field: "productName", message: "اسم المنتج مطلوب" });
  }
  if (!submission.productType?.trim()) {
    issues.push({ field: "productType", message: "نوع المنتج مطلوب" });
  }
  if (
    submission.productCondition !== PRODUCT_CONDITION.NEW &&
    submission.productCondition !== PRODUCT_CONDITION.OUTLET
  ) {
    issues.push({ field: "productCondition", message: "حالة المنتج غير صالحة" });
  }
  if (countFilledSpecs(submission) < 3) {
    issues.push({
      field: "specs",
      message: "يرجى تعبئة 3 مواصفات على الأقل (واط، فولت، سعة، قدرة، لون، أو إضافية)",
    });
  }
  if (submission.productCondition === PRODUCT_CONDITION.OUTLET) {
    if (!submission.outletReason?.trim() || submission.outletReason.trim().length < 10) {
      issues.push({
        field: "outletReason",
        message: "سبب الأوت ليت مطلوب (10 أحرف على الأقل) للعرض على العميل",
      });
    }
  }
  if (!submission.productImageUrl?.trim()) {
    issues.push({
      field: "productImageUrl",
      message: "صورة المنتج مطلوبة — ارفع ملفاً من جهازك",
    });
  } else if (!isValidPublicImageUrl(submission.productImageUrl)) {
    issues.push({
      field: "productImageUrl",
      message: "صورة المنتج غير صالحة — ارفع ملفاً من جهازك مرة أخرى",
    });
  }
  if (!Number.isFinite(submission.suggestedQuantity) || submission.suggestedQuantity < 1) {
    issues.push({
      field: "suggestedQuantity",
      message: "الكمية المستهدفة للحملة غير صالحة",
    });
  }
  if (
    submission.suggestedRetailPrice == null ||
    !Number.isFinite(submission.suggestedRetailPrice) ||
    submission.suggestedRetailPrice <= 0
  ) {
    issues.push({
      field: "suggestedRetailPrice",
      message: "السعر الفردي مطلوب",
    });
  }
  if (
    submission.suggestedGroupPrice == null ||
    !Number.isFinite(submission.suggestedGroupPrice) ||
    submission.suggestedGroupPrice <= 0
  ) {
    issues.push({
      field: "suggestedGroupPrice",
      message: "سعر الشراء الجماعي مطلوب",
    });
  }
  if (
    submission.suggestedRetailPrice != null &&
    submission.suggestedGroupPrice != null &&
    submission.suggestedGroupPrice >= submission.suggestedRetailPrice
  ) {
    issues.push({
      field: "suggestedGroupPrice",
      message: "سعر الجماعي يجب أن يكون أقل من السعر الفردي",
    });
  }

  return issues;
}

export function validateSubmissionInput(
  input: SubmissionForValidation,
): SubmissionValidationIssue[] {
  return validateSubmissionForApproval(input);
}

export function formatValidationIssues(issues: SubmissionValidationIssue[]): string {
  return issues.map((i) => `• ${i.message}`).join("\n");
}
