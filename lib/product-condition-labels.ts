import { PRODUCT_CONDITION } from "@/lib/db/constants";

export function productConditionLabel(condition: string): string {
  switch (condition) {
    case PRODUCT_CONDITION.NEW:
      return "جديد";
    case PRODUCT_CONDITION.OUTLET:
      return "أوت ليت";
    default:
      return condition;
  }
}

export function productConditionBadgeClass(condition: string): string {
  switch (condition) {
    case PRODUCT_CONDITION.NEW:
      return "bg-emerald-100 text-emerald-800";
    case PRODUCT_CONDITION.OUTLET:
      return "bg-orange-100 text-orange-900";
    default:
      return "bg-brand-gray/50 text-brand-navy";
  }
}
