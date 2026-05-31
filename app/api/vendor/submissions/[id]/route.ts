import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  formatValidationIssues,
  validateSubmissionInput,
} from "@/lib/submission-validation";
import { parseSubmissionProductBody } from "@/lib/submission-product-fields";
import { toSubmissionUpdateData } from "@/lib/submission-prisma-data";
import { APPROVAL_STATUS, USER_ROLES } from "@/lib/db/constants";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== USER_ROLES.VENDOR) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.productSubmission.findUnique({
    where: { id },
  });

  if (!existing || existing.vendorId !== session.userId) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  if (
    existing.status !== APPROVAL_STATUS.NEEDS_REVISION &&
    existing.status !== APPROVAL_STATUS.PENDING
  ) {
    return NextResponse.json(
      { error: "لا يمكن تعديل هذا الطلب في حالته الحالية" },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    const input = parseSubmissionProductBody(body);

    const issues = validateSubmissionInput(input);
    if (issues.length > 0) {
      return NextResponse.json(
        {
          error: "يرجى تصحيح البيانات",
          validationIssues: formatValidationIssues(issues),
        },
        { status: 400 },
      );
    }

    const updated = await prisma.productSubmission.update({
      where: { id },
      data: {
        ...toSubmissionUpdateData(input),
        status: APPROVAL_STATUS.PENDING,
        adminNote: null,
        reviewedAt: null,
      },
    });

    return NextResponse.json({ ok: true, submission: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
