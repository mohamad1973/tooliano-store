import { getSession } from "@/lib/auth/session";
import { USER_ROLES } from "@/lib/db/constants";
import { CampaignAlertsBell } from "@/components/notifications/CampaignAlertsBell";

const ROLES_WITH_BELL = new Set<string>([
  USER_ROLES.BUYER,
  USER_ROLES.VENDOR,
  USER_ROLES.ADMIN,
]);

export async function HeaderNotificationsBell({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  const session = await getSession();
  if (!session || !ROLES_WITH_BELL.has(session.role)) return null;

  return (
    <div className={className}>
      <CampaignAlertsBell onDark={onDark} />
    </div>
  );
}
