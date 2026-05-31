import { prisma } from "@/lib/db/prisma";
import { requireApiAdmin, isSessionResponse } from "@/lib/auth/api-session";
import { cmsMutationResponse, parseBody } from "@/lib/cms/admin-api";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const { id } = await params;
  const body = await parseBody<{
    visible?: boolean;
    sortOrder?: number;
    label?: string;
  }>(request);
  if (body instanceof Response) return body;

  await prisma.homeSection.update({
    where: { id },
    data: {
      ...(body.visible !== undefined ? { visible: body.visible } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
      ...(body.label !== undefined ? { label: body.label.trim() } : {}),
    },
  });

  return cmsMutationResponse();
}
