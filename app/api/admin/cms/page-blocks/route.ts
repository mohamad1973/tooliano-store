import { prisma } from "@/lib/db/prisma";
import { requireApiAdmin, isSessionResponse } from "@/lib/auth/api-session";
import { cmsMutationResponse, parseBody } from "@/lib/cms/admin-api";
import { PAGE_KEYS } from "@/lib/cms/page-blocks";

export async function GET(request: Request) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const { searchParams } = new URL(request.url);
  const pageKey = searchParams.get("pageKey") ?? PAGE_KEYS.HOME;

  const items = await prisma.pageBlock.findMany({
    where: { pageKey },
    orderBy: { sortOrder: "asc" },
  });
  return Response.json({ items });
}

export async function POST(request: Request) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const body = await parseBody<{
    pageKey?: string;
    type: string;
    payload: object;
  }>(request);
  if (body instanceof Response) return body;

  const pageKey = body.pageKey ?? PAGE_KEYS.HOME;
  const max = await prisma.pageBlock.aggregate({
    where: { pageKey },
    _max: { sortOrder: true },
  });

  const item = await prisma.pageBlock.create({
    data: {
      pageKey,
      type: body.type,
      payload: JSON.stringify(body.payload ?? {}),
      sortOrder: (max._max.sortOrder ?? -1) + 1,
      enabled: true,
    },
  });

  return cmsMutationResponse({ item });
}
