import { prisma } from "@/lib/db/prisma";
import { requireApiAdmin, isSessionResponse } from "@/lib/auth/api-session";
import { cmsMutationResponse, parseBody } from "@/lib/cms/admin-api";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const { id } = await params;
  const body = await parseBody<{
    type?: string;
    payload?: object;
    enabled?: boolean;
  }>(request);
  if (body instanceof Response) return body;

  await prisma.pageBlock.update({
    where: { id },
    data: {
      ...(body.type !== undefined ? { type: body.type } : {}),
      ...(body.payload !== undefined
        ? { payload: JSON.stringify(body.payload) }
        : {}),
      ...(body.enabled !== undefined ? { enabled: body.enabled } : {}),
    },
  });

  return cmsMutationResponse();
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const { id } = await params;
  await prisma.pageBlock.delete({ where: { id } });
  return cmsMutationResponse();
}
