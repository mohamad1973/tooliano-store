import { NextResponse } from "next/server";
import {
  isSessionResponse,
  requireApiBuyer,
} from "@/lib/auth/api-session";
import { getWalletSummary } from "@/lib/wallet/ledger";

/** ملخص محفظة المشتري المسجّل فقط — لا يقبل userId خارج الجلسة */
export async function GET() {
  const session = await requireApiBuyer();
  if (isSessionResponse(session)) return session;

  const summary = await getWalletSummary(session.userId);
  return NextResponse.json(summary);
}
