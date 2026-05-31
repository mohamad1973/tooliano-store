import { ORDER_STATUS, type OrderStatus } from "@/lib/db/constants";

const LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "بانتظار الدفع",
  PAID_LOCKED: "مدفوع — محجوز في المحفظة",
  CAMPAIGN_ACTIVE: "الحملة نشطة",
  READY_FOR_DELIVERY: "جاهز للتسليم",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغى",
  CAMPAIGN_FAILED: "فشلت الحملة — رصيد متاح",
};

export function orderStatusLabel(status: string): string {
  return LABELS[status as OrderStatus] ?? status;
}
