import "server-only";

import { prisma } from "@/lib/db/prisma";
import {
  APPROVAL_STATUS,
  CAMPAIGN_DECISION_ACTIONS,
  CAMPAIGN_OUTCOME,
  DEFAULT_CAMPAIGN_DAYS,
  NOTIFICATION_TYPES,
  type CampaignDecisionAction,
} from "@/lib/db/constants";
import { canApplyCampaignDecision } from "@/lib/campaign/status";
import {
  failCampaign,
  markCampaignAwaitingDecision,
  succeedCampaign,
} from "@/lib/campaign/sync";
import { createCampaignStatusNotifications } from "@/lib/notifications/create-campaign-status-notifications";

export type CampaignDurationInput = {
  days?: number;
  hours?: number;
  minutes?: number;
};

function durationToMinutes(duration?: CampaignDurationInput): number {
  const days = Number(duration?.days ?? 0);
  const hours = Number(duration?.hours ?? 0);
  const minutes = Number(duration?.minutes ?? 0);
  return days * 24 * 60 + hours * 60 + minutes;
}

export async function applyCampaignDecision(
  submissionId: string,
  action: CampaignDecisionAction,
  duration?: CampaignDurationInput,
): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  const submission = await prisma.productSubmission.findUnique({
    where: { id: submissionId },
  });

  if (
    !submission ||
    submission.status !== APPROVAL_STATUS.APPROVED ||
    !submission.publishedOnStore
  ) {
    return { ok: false, error: "العرض غير موجود أو غير منشور" };
  }

  if (
    !canApplyCampaignDecision(
      submission.campaignOutcome,
      submission.campaignEndsAt,
    )
  ) {
    return {
      ok: false,
      error: "لا يمكن اتخاذ قرار — العرض ما زال نشطاً أو تم إنهاؤه مسبقاً",
    };
  }

  if (submission.campaignOutcome === CAMPAIGN_OUTCOME.ACTIVE) {
    await markCampaignAwaitingDecision(submissionId, { notify: false });
  }

  switch (action) {
    case CAMPAIGN_DECISION_ACTIONS.EXTEND: {
      const totalMinutes = durationToMinutes(duration);
      const minutes =
        Number.isFinite(totalMinutes) && totalMinutes > 0
          ? totalMinutes
          : DEFAULT_CAMPAIGN_DAYS * 24 * 60;

      const campaignEndsAt = new Date();
      campaignEndsAt.setMinutes(campaignEndsAt.getMinutes() + minutes);

      await prisma.productSubmission.update({
        where: { id: submissionId },
        data: {
          campaignOutcome: CAMPAIGN_OUTCOME.ACTIVE,
          campaignEndsAt,
        },
      });

      await createCampaignStatusNotifications(
        submissionId,
        NOTIFICATION_TYPES.CAMPAIGN_EXTENDED,
        { orderIdSuffix: `extend:${Date.now()}` },
      );

      return { ok: true, message: "تم تمديد مدة العرض" };
    }

    case CAMPAIGN_DECISION_ACTIONS.EXECUTE: {
      await succeedCampaign(submissionId);
      await createCampaignStatusNotifications(
        submissionId,
        NOTIFICATION_TYPES.CAMPAIGN_EXECUTED,
        { orderIdSuffix: `execute:${Date.now()}` },
      );
      return { ok: true, message: "تم تنفيذ الصفقة على حالتها الحالية" };
    }

    case CAMPAIGN_DECISION_ACTIONS.CANCEL: {
      await failCampaign(submissionId);
      await createCampaignStatusNotifications(
        submissionId,
        NOTIFICATION_TYPES.CAMPAIGN_CANCELLED,
        { orderIdSuffix: `cancel:${Date.now()}` },
      );
      return { ok: true, message: "تم إنهاء الصفقة دون تنفيذ" };
    }

    default:
      return { ok: false, error: "إجراء غير معروف" };
  }
}
