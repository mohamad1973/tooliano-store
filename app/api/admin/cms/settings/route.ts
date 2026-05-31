import { prisma } from "@/lib/db/prisma";
import { requireApiAdmin, isSessionResponse } from "@/lib/auth/api-session";
import { cmsMutationResponse, parseBody } from "@/lib/cms/admin-api";

export async function GET() {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const rows = await prisma.siteSetting.findMany();
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return Response.json({ settings });
}

export async function PUT(request: Request) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const body = await parseBody<{ settings: Record<string, string> }>(request);
  if (body instanceof Response) return body;

  const entries = Object.entries(body.settings ?? {});
  for (const [key, value] of entries) {
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: String(value) },
      update: { value: String(value) },
    });
  }

  return cmsMutationResponse();
}
