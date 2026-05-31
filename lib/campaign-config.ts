/** إعدادات حملة الشراء الجماعي (مؤقت — حتى تُبنى قاعدة البيانات) */

export type GroupBuyCampaignConfig = {
  productId: number;
  retailPrice: number;
  groupPrice: number;
  targetQuantity: number;
  /** محجوز حالياً (تجريبي — يُستبدل لاحقاً من API) */
  reservedQuantity: number;
  endsAt: string;
  headline: string;
  subheadline: string;
};

const DEFAULT_PRODUCT_ID = Number(
  process.env.NEXT_PUBLIC_CAMPAIGN_PRODUCT_ID ?? "4846",
);

/** مدة العرض الافتراضية: 5 أيام من الآن عند كل build — للتطوير استخدم تاريخ ثابت في .env */
function getDefaultEndsAt(): string {
  const fromEnv = process.env.NEXT_PUBLIC_CAMPAIGN_ENDS_AT?.trim();
  if (fromEnv) return fromEnv;

  const end = new Date();
  end.setDate(end.getDate() + 5);
  return end.toISOString();
}

export function getCampaignConfig(
  productId?: number,
): GroupBuyCampaignConfig {
  const reserved = Number(
    process.env.NEXT_PUBLIC_CAMPAIGN_RESERVED_QTY ?? "45",
  );

  return {
    productId: productId ?? DEFAULT_PRODUCT_ID,
    retailPrice: Number(process.env.NEXT_PUBLIC_CAMPAIGN_RETAIL_PRICE ?? "1000"),
    groupPrice: Number(process.env.NEXT_PUBLIC_CAMPAIGN_GROUP_PRICE ?? "750"),
    targetQuantity: Number(
      process.env.NEXT_PUBLIC_CAMPAIGN_TARGET_QTY ?? "200",
    ),
    reservedQuantity: Number.isFinite(reserved) ? reserved : 45,
    endsAt: getDefaultEndsAt(),
    headline: "اشترِ جماعياً ووفّر أكثر",
    subheadline:
      "احجز قطعتك الآن — إذا اكتملت الحملة تحصل على السعر الجماعي. وإلا يُحوَّل مبلغك لمحفظتك بخيارات مرنة.",
  };
}

export function getRemainingQuantity(
  target: number,
  reserved: number,
): number {
  return Math.max(0, target - reserved);
}

export function getProgressPercent(
  target: number,
  reserved: number,
): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((reserved / target) * 100));
}

export function getSavingsPercent(
  retail: number,
  group: number,
): number {
  if (retail <= 0) return 0;
  return Math.round(((retail - group) / retail) * 100);
}
