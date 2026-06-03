import { NextResponse } from "next/server";
import {
  isSessionResponse,
  requireApiSession,
} from "@/lib/auth/api-session";
import { getCampaignBadgesForUser } from "@/lib/notifications/campaign-badges";

export async function GET() {
  const session = await requireApiSession();
  if (isSessionResponse(session)) return session;

  const badges = await getCampaignBadgesForUser(session);
  return NextResponse.json({ badges });
}
