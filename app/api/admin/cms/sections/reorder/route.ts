import { prisma } from "@/lib/db/prisma";
import { requireApiAdmin, isSessionResponse } from "@/lib/auth/api-session";
import { cmsMutationResponse, parseBody } from "@/lib/cms/admin-api";

export async function POST(request: Request) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const body = await parseBody<{ id: string; direction: "up" | "down" }>(
    request,
  );
  if (body instanceof Response) return body;

  const sections = await prisma.homeSection.findMany({
    orderBy: { sortOrder: "asc" },
  });
  const index = sections.findIndex((s) => s.id === body.id);
  if (index < 0) {
    return Response.json({ error: "قسم غير موجود" }, { status: 404 });
  }

  const swapIndex = body.direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= sections.length) {
    return cmsMutationResponse();
  }

  const current = sections[index];
  const other = sections[swapIndex];
  await prisma.$transaction([
    prisma.homeSection.update({
      where: { id: current.id },
      data: { sortOrder: other.sortOrder },
    }),
    prisma.homeSection.update({
      where: { id: other.id },
      data: { sortOrder: current.sortOrder },
    }),
  ]);

  return cmsMutationResponse();
}
