import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { APPROVAL_STATUS, USER_ROLES } from "@/lib/db/constants";

type Params = { params: Promise<{ userId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== USER_ROLES.ADMIN) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { userId } = await params;
  const body = await request.json();
  const status = String(body.status ?? "").trim();
  const adminNote = String(body.adminNote ?? "").trim() || null;

  if (
    status !== APPROVAL_STATUS.APPROVED &&
    status !== APPROVAL_STATUS.REJECTED
  ) {
    return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 });
  }

  const updated = await prisma.vendorProfile.update({
    where: { userId },
    data: {
      status,
      adminNote,
      reviewedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, profile: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== USER_ROLES.ADMIN) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { userId } = await params;
  const profile = await prisma.vendorProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  if (profile.status !== APPROVAL_STATUS.REJECTED) {
    return NextResponse.json(
      { error: "يمكن حذف طلبات التجار المرفوضة فقط" },
      { status: 400 },
    );
  }

  await prisma.$transaction([
    prisma.productSubmission.deleteMany({ where: { vendorId: userId } }),
    prisma.vendorProfile.delete({ where: { userId } }),
  ]);

  return NextResponse.json({ ok: true });
}
