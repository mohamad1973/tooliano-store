import { NextResponse } from "next/server";
import {
  isSessionResponse,
  requireApiBuyer,
} from "@/lib/auth/api-session";
import { getWalletSummary } from "@/lib/wallet/ledger";

/** محفظة المشتري فقط — التاجر/المندوب يحصلون على 403 */
export async function GET() {
  const session = await requireApiBuyer();
  if (isSessionResponse(session)) return session;

  const summary = await getWalletSummary(session.userId);
  return NextResponse.json(summary);
}
