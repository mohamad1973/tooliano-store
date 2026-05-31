import { prisma } from "@/lib/db/prisma";
import { requireApiAdmin, isSessionResponse } from "@/lib/auth/api-session";
import { cmsMutationResponse, parseBody } from "@/lib/cms/admin-api";
import { normalizeNavMenuPayload } from "@/lib/cms/normalize-nav-menu-payload";

export async function GET() {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const items = await prisma.navMenuItem.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return Response.json({ items });
}

export async function POST(request: Request) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const body = await parseBody<{
    label: string;
    href: string;
    linkType?: string;
    categorySlug?: string;
  }>(request);
  if (body instanceof Response) return body;
  if (!body.label?.trim() || !body.href?.trim()) {
    return Response.json({ error: "الاسم والرابط مطلوبان" }, { status: 400 });
  }

  const normalized = normalizeNavMenuPayload(body);

  const max = await prisma.navMenuItem.aggregate({ _max: { sortOrder: true } });
  const item = await prisma.navMenuItem.create({
    data: {
      label: normalized.label!.trim(),
      href: normalized.href!.trim(),
      linkType: normalized.linkType ?? "internal",
      categorySlug: normalized.categorySlug?.trim() || null,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
      enabled: true,
    },
  });

  return cmsMutationResponse({ item });
}
