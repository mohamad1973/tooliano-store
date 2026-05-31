import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { findDuplicateSubmission } from "@/lib/submission-idempotency";
import {
  formatValidationIssues,
  validateSubmissionInput,
} from "@/lib/submission-validation";
import { parseSubmissionProductBody } from "@/lib/submission-product-fields";
import { toSubmissionCreateData } from "@/lib/submission-prisma-data";
import { APPROVAL_STATUS, USER_ROLES } from "@/lib/db/constants";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== USER_ROLES.VENDOR) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const input = parseSubmissionProductBody(body);
    const idempotencyKey =
      String(body.idempotencyKey ?? "").trim() || null;

    const issues = validateSubmissionInput({
      ...input,
      productDescription: input.productDescription,
    });
    if (issues.length > 0) {
      return NextResponse.json(
        {
          error: "يرجى تصحيح البيانات",
          validationIssues: formatValidationIssues(issues),
        },
        { status: 400 },
      );
    }

    if (!Number.isFinite(input.suggestedQuantity) || input.suggestedQuantity < 1) {
      return NextResponse.json(
        { error: "الكمية المقترحة غير صالحة" },
        { status: 400 },
      );
    }

    const duplicate = await findDuplicateSubmission({
      vendorId: session.userId,
      productName: input.productName,
      idempotencyKey,
    });
    if (duplicate) {
      return NextResponse.json({
        ok: true,
        submission: duplicate,
        duplicate: true,
        message: "هذا المنتج مُرسل مسبقاً للمراجعة خلال الدقيقة الأخيرة.",
      });
    }

    const submission = await prisma.productSubmission.create({
      data: toSubmissionCreateData(session.userId, input, {
        idempotencyKey,
        status: APPROVAL_STATUS.PENDING,
      }),
    });

    return NextResponse.json({
      ok: true,
      submission,
      message: "تم إرسال المنتج للمراجعة بنجاح.",
    });
  } catch (e) {
    console.error("POST /api/vendor/submissions:", e);
    const message =
      e instanceof Error ? e.message : "خطأ غير متوقع";
    return NextResponse.json(
      {
        error: "خطأ في الخادم",
        detail:
          process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 },
    );
  }
}
