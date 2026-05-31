import { prisma } from "@/lib/db/prisma";
import { requireApiAdmin, isSessionResponse } from "@/lib/auth/api-session";
import { cmsMutationResponse, parseBody } from "@/lib/cms/admin-api";

export async function GET() {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const items = await prisma.marqueeItem.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return Response.json({ items });
}

export async function POST(request: Request) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const body = await parseBody<{ text: string }>(request);
  if (body instanceof Response) return body;
  if (!body.text?.trim()) {
    return Response.json({ error: "النص مطلوب" }, { status: 400 });
  }

  const max = await prisma.marqueeItem.aggregate({ _max: { sortOrder: true } });
  const item = await prisma.marqueeItem.create({
    data: {
      text: body.text.trim(),
      sortOrder: (max._max.sortOrder ?? -1) + 1,
      enabled: true,
    },
  });

  return cmsMutationResponse({ item });
}
