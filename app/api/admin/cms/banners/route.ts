import { prisma } from "@/lib/db/prisma";
import { requireApiAdmin, isSessionResponse } from "@/lib/auth/api-session";
import { cmsMutationResponse, parseBody } from "@/lib/cms/admin-api";

export async function GET() {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const items = await prisma.homeBanner.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return Response.json({ items });
}

export async function POST(request: Request) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const body = await parseBody<{
    imageUrl: string;
    categorySlug?: string;
    title?: string;
  }>(request);
  if (body instanceof Response) return body;
  if (!body.imageUrl?.trim()) {
    return Response.json({ error: "رابط الصورة مطلوب" }, { status: 400 });
  }

  const max = await prisma.homeBanner.aggregate({ _max: { sortOrder: true } });
  const item = await prisma.homeBanner.create({
    data: {
      imageUrl: body.imageUrl.trim(),
      categorySlug: body.categorySlug?.trim() || null,
      title: body.title?.trim() || null,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
      enabled: true,
    },
  });

  return cmsMutationResponse({ item });
}
