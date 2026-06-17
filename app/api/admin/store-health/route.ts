import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { APPROVAL_STATUS, USER_ROLES } from "@/lib/db/constants";

function exclusionReasons(row: {
  status: string;
  adminHidden: boolean;
  campaignEndsAt: Date | null;
  suggestedRetailPrice: number | null;
  suggestedGroupPrice: number | null;
}) {
  const reasons: string[] = [];
  if (row.status !== APPROVAL_STATUS.APPROVED) reasons.push("not_approved");
  if (row.adminHidden) reasons.push("admin_hidden");
  if (!row.campaignEndsAt) reasons.push("missing_campaign_ends_at");
  if (row.suggestedRetailPrice == null) reasons.push("missing_retail_price");
  if (row.suggestedGroupPrice == null) reasons.push("missing_group_price");
  return reasons;
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== USER_ROLES.ADMIN) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const [total, approved, visibleCards, rows] = await Promise.all([
    prisma.productSubmission.count(),
    prisma.productSubmission.count({
      where: { status: APPROVAL_STATUS.APPROVED },
    }),
    prisma.productSubmission.count({
      where: {
        status: APPROVAL_STATUS.APPROVED,
        adminHidden: false,
      },
    }),
    prisma.productSubmission.findMany({
      orderBy: { updatedAt: "desc" },
      take: 200,
      select: {
        id: true,
        productName: true,
        status: true,
        publishedOnStore: true,
        adminHidden: true,
        campaignOutcome: true,
        campaignEndsAt: true,
        suggestedRetailPrice: true,
        suggestedGroupPrice: true,
        updatedAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    total,
    approved,
    visibleCards,
    products: rows.map((row) => ({
      ...row,
      shownInGroupBuy: row.status === APPROVAL_STATUS.APPROVED && !row.adminHidden,
      exclusionReasons: exclusionReasons(row),
    })),
  });
}
