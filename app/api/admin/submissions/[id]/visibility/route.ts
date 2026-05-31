import { NextResponse } from "next/server";
import { setSubmissionAdminHidden } from "@/lib/admin-submission-visibility";
import { getSession } from "@/lib/auth/session";
import { USER_ROLES } from "@/lib/db/constants";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== USER_ROLES.ADMIN) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as { hidden?: boolean };

  if (typeof body.hidden !== "boolean") {
    return NextResponse.json({ error: "حقل hidden مطلوب" }, { status: 400 });
  }

  const result = await setSubmissionAdminHidden(id, body.hidden);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ ok: true, submission: result.submission });
}
