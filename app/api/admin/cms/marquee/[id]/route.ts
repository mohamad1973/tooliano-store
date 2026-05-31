import { prisma } from "@/lib/db/prisma";
import { requireApiAdmin, isSessionResponse } from "@/lib/auth/api-session";
import { cmsMutationResponse, parseBody } from "@/lib/cms/admin-api";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const { id } = await params;
  const body = await parseBody<{
    text?: string;
    sortOrder?: number;
    enabled?: boolean;
  }>(request);
  if (body instanceof Response) return body;

  await prisma.marqueeItem.update({
    where: { id },
    data: {
      ...(body.text !== undefined ? { text: body.text.trim() } : {}),
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
  await prisma.marqueeItem.delete({ where: { id } });
  return cmsMutationResponse();
}
