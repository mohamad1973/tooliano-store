import { prisma } from "@/lib/db/prisma";
import { requireApiAdmin, isSessionResponse } from "@/lib/auth/api-session";
import { cmsMutationResponse, parseBody } from "@/lib/cms/admin-api";
import { isSocialPlatformId } from "@/lib/cms/social-platforms";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const { id } = await params;
  const body = await parseBody<{
    platform?: string;
    label?: string;
    url?: string;
    sortOrder?: number;
    enabled?: boolean;
  }>(request);
  if (body instanceof Response) return body;

  if (body.platform !== undefined && !isSocialPlatformId(body.platform)) {
    return Response.json({ error: "منصة غير صالحة" }, { status: 400 });
  }

  if (
    body.url !== undefined &&
    body.url.trim() &&
    !body.url.trim().startsWith("http://") &&
    !body.url.trim().startsWith("https://")
  ) {
    return Response.json({ error: "رابط غير صالح" }, { status: 400 });
  }

  await prisma.socialLink.update({
    where: { id },
    data: {
      ...(body.platform !== undefined ? { platform: body.platform } : {}),
      ...(body.label !== undefined ? { label: body.label.trim() } : {}),
      ...(body.url !== undefined ? { url: body.url.trim() } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
      ...(body.enabled !== undefined ? { enabled: body.enabled } : {}),
    },
  });

  return cmsMutationResponse();
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const { id } = await params;
  await prisma.socialLink.delete({ where: { id } });
  return cmsMutationResponse();
}
