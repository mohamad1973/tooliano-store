import { prisma } from "@/lib/db/prisma";
import { requireApiAdmin, isSessionResponse } from "@/lib/auth/api-session";
import { cmsMutationResponse, parseBody } from "@/lib/cms/admin-api";
import { normalizeHomeBannerPlacement } from "@/lib/cms/home-banner-layout";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const { id } = await params;
  const body = await parseBody<{
    imageUrl?: string;
    categorySlug?: string | null;
    title?: string | null;
    placement?: string | null;
    href?: string | null;
    altText?: string | null;
    sortOrder?: number;
    enabled?: boolean;
  }>(request);
  if (body instanceof Response) return body;

  await prisma.homeBanner.update({
    where: { id },
    data: {
      ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl.trim() } : {}),
      ...(body.categorySlug !== undefined
        ? { categorySlug: body.categorySlug?.trim() || null }
        : {}),
      ...(body.title !== undefined
        ? { title: body.title?.trim() || null }
        : {}),
      ...(body.placement !== undefined
        ? { placement: normalizeHomeBannerPlacement(body.placement) }
        : {}),
      ...(body.href !== undefined ? { href: body.href?.trim() || null } : {}),
      ...(body.altText !== undefined
        ? { altText: body.altText?.trim() || null }
        : {}),
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
  await prisma.homeBanner.delete({ where: { id } });
  return cmsMutationResponse();
}
