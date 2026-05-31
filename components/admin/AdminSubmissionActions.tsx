"use client";

import { AdminDeleteSubmissionButton } from "@/components/admin/AdminDeleteSubmissionButton";
import { AdminHideSubmissionButton } from "@/components/admin/AdminHideSubmissionButton";

export function AdminSubmissionActions({
  submissionId,
  adminHidden,
}: {
  submissionId: string;
  adminHidden: boolean;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-start gap-3 border-t border-brand-gray pt-3">
      <AdminHideSubmissionButton
        submissionId={submissionId}
        hidden={adminHidden}
      />
      <AdminDeleteSubmissionButton submissionId={submissionId} />
    </div>
  );
}
