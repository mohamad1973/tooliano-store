export const USER_ROLES = {
  BUYER: "BUYER",
  VENDOR: "VENDOR",
  ADMIN: "ADMIN",
  DELIVERY_AGENT: "DELIVERY_AGENT",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const BUSINESS_TYPES = {
  AGENT: "AGENT",
  DISTRIBUTOR: "DISTRIBUTOR",
} as const;

export type BusinessType =
  (typeof BUSINESS_TYPES)[keyof typeof BUSINESS_TYPES];

export const APPROVAL_STATUS = {
  PENDING: "PENDING",
  NEEDS_REVISION: "NEEDS_REVISION",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export const WOO_SYNC_STATUS = {
  NONE: "none",
  SYNCED: "synced",
  FAILED: "failed",
} as const;

export type WooSyncStatus =
  (typeof WOO_SYNC_STATUS)[keyof typeof WOO_SYNC_STATUS];

export const DEFAULT_CAMPAIGN_DAYS = 7;

export const PRODUCT_CONDITION = {
  NEW: "NEW",
  OUTLET: "OUTLET",
} as const;

export type ProductCondition =
  (typeof PRODUCT_CONDITION)[keyof typeof PRODUCT_CONDITION];

export type ApprovalStatus =
  (typeof APPROVAL_STATUS)[keyof typeof APPROVAL_STATUS];

export const WALLET_TX_TYPES = {
  DEPOSIT: "DEPOSIT",
  LOCK: "LOCK",
  UNLOCK: "UNLOCK",
  SETTLE_TO_PLATFORM: "SETTLE_TO_PLATFORM",
  REFUND: "REFUND",
  AFFILIATE_COMMISSION: "AFFILIATE_COMMISSION",
  AFFILIATE_REVERSAL: "AFFILIATE_REVERSAL",
} as const;

export type WalletTxType =
  (typeof WALLET_TX_TYPES)[keyof typeof WALLET_TX_TYPES];

export const ORDER_STATUS = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PAID_LOCKED: "PAID_LOCKED",
  CAMPAIGN_ACTIVE: "CAMPAIGN_ACTIVE",
  READY_FOR_DELIVERY: "READY_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  CAMPAIGN_FAILED: "CAMPAIGN_FAILED",
} as const;

export type OrderStatus =
  (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const CAMPAIGN_OUTCOME = {
  ACTIVE: "ACTIVE",
  SUCCEEDED: "SUCCEEDED",
  FAILED: "FAILED",
} as const;

export type CampaignOutcome =
  (typeof CAMPAIGN_OUTCOME)[keyof typeof CAMPAIGN_OUTCOME];

export const DEFAULT_DEPOSIT_PERCENT = Number(
  process.env.DEPOSIT_PERCENT ?? "5",
);

export const DELIVERY_CODE_TTL_DAYS = Number(
  process.env.DELIVERY_CODE_TTL_DAYS ?? "7",
);

export const DELIVERY_CODE_MAX_ATTEMPTS = Number(
  process.env.DELIVERY_CODE_MAX_ATTEMPTS ?? "10",
);

export const NOTIFICATION_TYPES = {
  BOOKING_CONFIRMED: "BOOKING_CONFIRMED",
  CAMPAIGN_REMAINING: "CAMPAIGN_REMAINING",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];
