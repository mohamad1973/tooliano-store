import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { parseSubmissionProductBody } from "@/lib/submission-product-fields";
import { toSubmissionCreateData } from "@/lib/submission-prisma-data";
import {
  formatValidationIssues,
  validateSubmissionInput,
} from "@/lib/submission-validation";
import {
  APPROVAL_STATUS,
  BUSINESS_TYPES,
  USER_ROLES,
} from "@/lib/db/constants";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");
    const companyName = String(body.companyName ?? "").trim();
    const contactName = String(body.contactName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const contactEmail = String(body.contactEmail ?? "").trim();
    const address = String(body.address ?? "").trim();
    const businessType = String(body.businessType ?? "").trim();
    const teamSize = Number.parseInt(String(body.teamSize ?? ""), 10);
    const productTypesDescription = String(
      body.productTypesDescription ?? "",
    ).trim();

    const productInput = parseSubmissionProductBody(body);
    const idempotencyKey =
      String(body.idempotencyKey ?? "").trim() || null;

    if (username.length < 3 || password.length < 6) {
      return NextResponse.json(
        { error: "تحقق من اسم المستخدم وكلمة المرور" },
        { status: 400 },
      );
    }
    if (!phone) {
      return NextResponse.json(
        { error: "رقم الموبايل مطلوب" },
        { status: 400 },
      );
    }
    if (
      !companyName ||
      !contactName ||
      !phone ||
      !contactEmail ||
      !address ||
      !productTypesDescription ||
      !productInput.productName ||
      !productInput.productType
    ) {
      return NextResponse.json(
        { error: "يرجى تعبئة جميع الحقول المطلوبة" },
        { status: 400 },
      );
    }
    if (
      businessType !== BUSINESS_TYPES.AGENT &&
      businessType !== BUSINESS_TYPES.DISTRIBUTOR
    ) {
      return NextResponse.json(
        { error: "نوع النشاط غير صالح" },
        { status: 400 },
      );
    }
    if (!Number.isFinite(teamSize) || teamSize < 1) {
      return NextResponse.json(
        { error: "حجم العمالة غير صالح" },
        { status: 400 },
      );
    }

    const productIssues = validateSubmissionInput(productInput);
    if (productIssues.length > 0) {
      return NextResponse.json(
        {
          error: "يرجى تصحيح بيانات المنتج",
          validationIssues: formatValidationIssues(productIssues),
        },
        { status: 400 },
      );
    }

    if (
      !Number.isFinite(productInput.suggestedQuantity) ||
      productInput.suggestedQuantity < 1
    ) {
      return NextResponse.json(
        { error: "الكمية المقترحة غير صالحة" },
        { status: 400 },
      );
    }

    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) {
      return NextResponse.json(
        { error: "اسم المستخدم مستخدم بالفعل" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          username,
          passwordHash,
          role: USER_ROLES.VENDOR,
          phone,
          email: contactEmail,
        },
      });

      await tx.vendorProfile.create({
        data: {
          userId: created.id,
          companyName,
          contactName,
          phone,
          contactEmail,
          address,
          businessType,
          teamSize,
          productTypesDescription,
          status: APPROVAL_STATUS.PENDING,
        },
      });

      await tx.productSubmission.create({
        data: toSubmissionCreateData(created.id, productInput, {
          idempotencyKey,
          status: APPROVAL_STATUS.PENDING,
        }),
      });

      return created;
    });

    await createSession({
      userId: user.id,
      username: user.username,
      role: USER_ROLES.VENDOR,
    });

    return NextResponse.json({ ok: true, redirectTo: "/vendor" });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        error: "خطأ في الخادم",
        detail:
          process.env.NODE_ENV === "development" && e instanceof Error
            ? e.message
            : undefined,
      },
      { status: 500 },
    );
  }
}
