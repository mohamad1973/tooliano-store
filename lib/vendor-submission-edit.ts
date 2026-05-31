import { APPROVAL_STATUS } from "@/lib/db/constants";

/** حالات يسمح للتاجر بتعديل المنتج فيها */
export const VENDOR_EDITABLE_SUBMISSION_STATUSES = [
  APPROVAL_STATUS.PENDING,
  APPROVAL_STATUS.NEEDS_REVISION,
  APPROVAL_STATUS.REJECTED,
] as const;

export function canVendorEditSubmission(status: string): boolean {
  return (VENDOR_EDITABLE_SUBMISSION_STATUSES as readonly string[]).includes(
    status,
  );
}
