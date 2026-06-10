import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  CAMPAIGN_DECISION_ACTIONS,
  USER_ROLES,
  type CampaignDecisionAction,
} from "@/lib/db/constants";
import { prisma } from "@/lib/db/prisma";
import { applyCampaignDecision } from "@/lib/campaign/decision";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== USER_ROLES.VENDOR) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await params;
  const submission = await prisma.productSubmission.findUnique({
    where: { id },
    select: { vendorId: true },
  });

  if (!submission || submission.vendorId !== session.userId) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  const body = (await request.json()) as {
    action?: CampaignDecisionAction;
    duration?: { days?: number; hours?: number; minutes?: number };
  };

  const action = body.action;
  if (
    !action ||
    !Object.values(CAMPAIGN_DECISION_ACTIONS).includes(action)
  ) {
    return NextResponse.json({ error: "إجراء غير صالح" }, { status: 400 });
  }

  const result = await applyCampaignDecision(id, action, body.duration);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, message: result.message });
}
