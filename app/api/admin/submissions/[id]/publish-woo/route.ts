import { NextResponse } from "next/server";
import { publishSubmissionToWooCommerce } from "@/lib/admin-publish-woo";
import { getSession } from "@/lib/auth/session";
import { USER_ROLES } from "@/lib/db/constants";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== USER_ROLES.ADMIN) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await params;
  const result = await publishSubmissionToWooCommerce(id);

  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.error,
        validationIssues: result.validationIssues,
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    wooProductId: result.wooProductId,
    submission: result.submission,
  });
}
