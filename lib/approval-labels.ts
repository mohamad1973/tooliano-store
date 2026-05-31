import { APPROVAL_STATUS, BUSINESS_TYPES } from "@/lib/db/constants";

export function approvalStatusLabel(status: string): string {
  switch (status) {
    case APPROVAL_STATUS.APPROVED:
      return "موافق عليه";
    case APPROVAL_STATUS.REJECTED:
      return "مرفوض";
    case APPROVAL_STATUS.NEEDS_REVISION:
      return "يحتاج تعديل";
    default:
      return "قيد المراجعة";
  }
}

export function businessTypeLabel(type: string): string {
  switch (type) {
    case BUSINESS_TYPES.AGENT:
      return "وكيل";
    case BUSINESS_TYPES.DISTRIBUTOR:
      return "موزع";
    default:
      return type;
  }
}

export function approvalStatusClass(status: string): string {
  switch (status) {
    case APPROVAL_STATUS.APPROVED:
      return "bg-emerald-100 text-emerald-800";
    case APPROVAL_STATUS.REJECTED:
      return "bg-red-100 text-red-800";
    case APPROVAL_STATUS.NEEDS_REVISION:
      return "bg-sky-100 text-sky-900";
    default:
      return "bg-amber-100 text-amber-900";
  }
}
