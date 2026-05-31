export const USER_ROLES = {
  BUYER: "BUYER",
  VENDOR: "VENDOR",
  ADMIN: "ADMIN",
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

/** مدة الحملة الافتراضية بعد الموافقة (أيام) */
export const DEFAULT_CAMPAIGN_DAYS = 7;

export const PRODUCT_CONDITION = {
  NEW: "NEW",
  OUTLET: "OUTLET",
} as const;

export type ProductCondition =
  (typeof PRODUCT_CONDITION)[keyof typeof PRODUCT_CONDITION];

export type ApprovalStatus =
  (typeof APPROVAL_STATUS)[keyof typeof APPROVAL_STATUS];
