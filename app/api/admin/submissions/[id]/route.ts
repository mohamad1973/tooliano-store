import { NextResponse } from "next/server";
import { approveProductSubmission } from "@/lib/admin-approve-submission";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { APPROVAL_STATUS, USER_ROLES } from "@/lib/db/constants";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== USER_ROLES.ADMIN) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const status = String(body.status ?? "").trim();
  const adminNote = String(body.adminNote ?? "").trim() || null;

  if (status === APPROVAL_STATUS.APPROVED) {
    const result = await approveProductSubmission(id, adminNote);
    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error,
          validationIssues: result.validationIssues,
        },
        { status: 400 },
      );
    }
    return NextResponse.json({ ok: true, submission: result.submission });
  }

  if (status === APPROVAL_STATUS.NEEDS_REVISION) {
    if (!adminNote) {
      return NextResponse.json(
        { error: "يرجى كتابة تعليق يوضح ما يجب على التاجر تعديله" },
        { status: 400 },
      );
    }

    const updated = await prisma.productSubmission.update({
      where: { id },
      data: {
        status: APPROVAL_STATUS.NEEDS_REVISION,
        adminNote,
        reviewedAt: new Date(),
        publishedOnStore: false,
      },
    });

    return NextResponse.json({ ok: true, submission: updated });
  }

  if (status === APPROVAL_STATUS.REJECTED) {
    const updated = await prisma.productSubmission.update({
      where: { id },
      data: {
        status: APPROVAL_STATUS.REJECTED,
        adminNote,
        reviewedAt: new Date(),
        publishedOnStore: false,
      },
    });

    return NextResponse.json({ ok: true, submission: updated });
  }

  if (status === APPROVAL_STATUS.PENDING) {
    const updated = await prisma.productSubmission.update({
      where: { id },
      data: {
        status: APPROVAL_STATUS.PENDING,
        adminNote,
      },
    });
    return NextResponse.json({ ok: true, submission: updated });
  }

  return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== USER_ROLES.ADMIN) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await params;
  const submission = await prisma.productSubmission.findUnique({
    where: { id },
  });

  if (!submission) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  if (submission.status !== APPROVAL_STATUS.REJECTED) {
    return NextResponse.json(
      { error: "يمكن حذف الطلبات المرفوضة فقط" },
      { status: 400 },
    );
  }

  await prisma.productSubmission.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
