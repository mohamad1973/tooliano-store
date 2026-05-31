import { prisma } from "@/lib/db/prisma";
import { requireApiAdmin, isSessionResponse } from "@/lib/auth/api-session";
import { cmsMutationResponse, parseBody } from "@/lib/cms/admin-api";

export async function POST(request: Request) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const body = await parseBody<{ orderedIds: string[] }>(request);
  if (body instanceof Response) return body;

  const ids = body.orderedIds ?? [];
  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.navMenuItem.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  return cmsMutationResponse();
}
