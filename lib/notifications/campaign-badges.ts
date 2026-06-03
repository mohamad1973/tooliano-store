import "server-only";

import { prisma } from "@/lib/db/prisma";
import {
  APPROVAL_STATUS,
  CAMPAIGN_OUTCOME,
  ORDER_STATUS,
  USER_ROLES,
} from "@/lib/db/constants";
import { buildCampaignProgress } from "@/lib/campaign/progress";
import type { SessionPayload } from "@/lib/auth/session";

const PAID_STATUSES = [
  ORDER_STATUS.PAID_LOCKED,
  ORDER_STATUS.CAMPAIGN_ACTIVE,
  ORDER_STATUS.READY_FOR_DELIVERY,
  ORDER_STATUS.DELIVERED,
];

export async function getCampaignBadgesForUser(session: SessionPayload) {
  if (session.role === USER_ROLES.BUYER) {
    const orders = await prisma.groupBuyOrder.findMany({
      where: {
        buyerId: session.userId,
        paidOnlineTotal: { gt: 0 },
        submission: {
          campaignOutcome: CAMPAIGN_OUTCOME.ACTIVE,
          status: APPROVAL_STATUS.APPROVED,
        },
      },
      include: {
        submission: {
          select: {
            id: true,
            productName: true,
            suggestedQuantity: true,
            reservedQuantity: true,
            boostReservedQuantity: true,
          },
        },
      },
      distinct: ["submissionId"],
    });

    return orders.map((o) => {
      const p = buildCampaignProgress({
        submissionId: o.submission.id,
        productName: o.submission.productName,
        suggestedQuantity: o.submission.suggestedQuantity,
        reservedQuantity: o.submission.reservedQuantity,
        boostReservedQuantity: o.submission.boostReservedQuantity,
      });
      return {
        ...p,
        href: `/campaign/offer/${o.submission.id}`,
      };
    });
  }

  if (session.role === USER_ROLES.VENDOR) {
    const subs = await prisma.productSubmission.findMany({
      where: {
        vendorId: session.userId,
        status: APPROVAL_STATUS.APPROVED,
        publishedOnStore: true,
        campaignOutcome: CAMPAIGN_OUTCOME.ACTIVE,
      },
      select: {
        id: true,
        productName: true,
        suggestedQuantity: true,
        reservedQuantity: true,
        boostReservedQuantity: true,
      },
    });
    return subs.map((s) => {
      const p = buildCampaignProgress({
        submissionId: s.id,
        productName: s.productName,
        suggestedQuantity: s.suggestedQuantity,
        reservedQuantity: s.reservedQuantity,
        boostReservedQuantity: s.boostReservedQuantity,
      });
      return { ...p, href: `/campaign/offer/${s.id}` };
    });
  }

  if (session.role === USER_ROLES.ADMIN) {
    const subs = await prisma.productSubmission.findMany({
      where: {
        status: APPROVAL_STATUS.APPROVED,
        publishedOnStore: true,
        campaignOutcome: CAMPAIGN_OUTCOME.ACTIVE,
      },
      select: {
        id: true,
        productName: true,
        suggestedQuantity: true,
        reservedQuantity: true,
        boostReservedQuantity: true,
      },
      take: 50,
      orderBy: { updatedAt: "desc" },
    });
    return subs.map((s) => {
      const p = buildCampaignProgress({
        submissionId: s.id,
        productName: s.productName,
        suggestedQuantity: s.suggestedQuantity,
        reservedQuantity: s.reservedQuantity,
        boostReservedQuantity: s.boostReservedQuantity,
      });
      return { ...p, href: `/campaign/offer/${s.id}` };
    });
  }

  return [];
}
