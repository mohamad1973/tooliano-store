import type { ProductSubmission } from "@prisma/client";
import { PRODUCT_CONDITION } from "@/lib/db/constants";
import { productConditionLabel } from "@/lib/product-condition-labels";
import { buildSpecRows } from "@/lib/submission-product-fields";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function buildWooProductDescriptionHtml(
  submission: ProductSubmission,
): string {
  const parts: string[] = [];
  const conditionLabel = productConditionLabel(submission.productCondition);

  parts.push(
    `<p><strong>حالة المنتج:</strong> ${escapeHtml(conditionLabel)}</p>`,
  );
  parts.push(
    `<p><strong>نوع المنتج:</strong> ${escapeHtml(submission.productType)}</p>`,
  );

  if (
    submission.productCondition === PRODUCT_CONDITION.OUTLET &&
    submission.outletReason
  ) {
    parts.push(
      `<p><strong>سبب الأوت ليت:</strong> ${escapeHtml(submission.outletReason).replace(/\n/g, "<br>")}</p>`,
    );
  }

  const rows = buildSpecRows(submission);
  if (rows.length > 0) {
    parts.push("<h3>المواصفات</h3><ul>");
    for (const row of rows) {
      parts.push(
        `<li><strong>${escapeHtml(row.label)}:</strong> ${escapeHtml(row.value)}</li>`,
      );
    }
    parts.push("</ul>");
  }

  if (submission.productDescription?.trim()) {
    parts.push(
      `<p>${escapeHtml(submission.productDescription).replace(/\n/g, "<br>")}</p>`,
    );
  }

  return parts.join("\n");
}

export function buildWooShortDescription(submission: ProductSubmission): string {
  const conditionLabel = productConditionLabel(submission.productCondition);
  return `${submission.productType} — ${conditionLabel}`;
}
