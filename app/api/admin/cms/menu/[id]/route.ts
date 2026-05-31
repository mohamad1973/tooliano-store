import { prisma } from "@/lib/db/prisma";
import { requireApiAdmin, isSessionResponse } from "@/lib/auth/api-session";
import { cmsMutationResponse, parseBody } from "@/lib/cms/admin-api";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const { id } = await params;
  const body = await parseBody<{
    label?: string;
    href?: string;
    linkType?: string;
    categorySlug?: string | null;
    enabled?: boolean;
  }>(request);
  if (body instanceof Response) return body;

  await prisma.navMenuItem.update({
    where: { id },
    data: {
      ...(body.label !== undefined ? { label: body.label.trim() } : {}),
      ...(body.href !== undefined ? { href: body.href.trim() } : {}),
      ...(body.linkType !== undefined ? { linkType: body.linkType } : {}),
      ...(body.categorySlug !== undefined
        ? { categorySlug: body.categorySlug?.trim() || null }
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
  await prisma.navMenuItem.delete({ where: { id } });
  return cmsMutationResponse();
}
