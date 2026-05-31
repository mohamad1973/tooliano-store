import "server-only";

import { createHash, randomInt } from "crypto";
import { DELIVERY_CODE_MAX_ATTEMPTS, DELIVERY_CODE_TTL_DAYS } from "@/lib/db/constants";

function getPepper(): string {
  const pepper = process.env.DELIVERY_CODE_PEPPER ?? process.env.JWT_SECRET;
  if (!pepper || pepper.length < 16) {
    throw new Error("DELIVERY_CODE_PEPPER or JWT_SECRET required");
  }
  return pepper;
}

export function generateDeliveryCode(): string {
  return String(randomInt(100000, 1000000));
}

export function hashDeliveryCode(code: string): string {
  return createHash("sha256")
    .update(`${getPepper()}:${code}`)
    .digest("hex");
}

export function verifyDeliveryCode(code: string, hash: string): boolean {
  const normalized = code.replace(/\D/g, "");
  if (normalized.length !== 6) return false;
  const expected = hashDeliveryCode(normalized);
  return expected === hash;
}

export function deliveryCodeExpiresAt(from: Date = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + DELIVERY_CODE_TTL_DAYS);
  return d;
}

export { DELIVERY_CODE_MAX_ATTEMPTS };
