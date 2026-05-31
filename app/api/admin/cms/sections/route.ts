import { prisma } from "@/lib/db/prisma";
import { requireApiAdmin, isSessionResponse } from "@/lib/auth/api-session";

export async function GET() {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const items = await prisma.homeSection.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return Response.json({ items });
}
