import { prisma } from "@/lib/db/prisma";
import { requireApiAdmin, isSessionResponse } from "@/lib/auth/api-session";
import { cmsMutationResponse, parseBody } from "@/lib/cms/admin-api";
import { isSocialPlatformId, getSocialPlatformDef } from "@/lib/cms/social-platforms";

export async function GET() {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const items = await prisma.socialLink.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return Response.json({ items });
}

export async function POST(request: Request) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const body = await parseBody<{
    platform: string;
    label?: string;
    url?: string;
  }>(request);
  if (body instanceof Response) return body;

  if (!body.platform || !isSocialPlatformId(body.platform)) {
    return Response.json({ error: "منصة غير صالحة" }, { status: 400 });
  }

  const def = getSocialPlatformDef(body.platform)!;
  const url = body.url?.trim() || def.defaultUrl;
  const label = body.label?.trim() || def.labelAr;

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return Response.json({ error: "الرابط يجب أن يبدأ بـ http أو https" }, {
      status: 400,
    });
  }

  const max = await prisma.socialLink.aggregate({ _max: { sortOrder: true } });
  const item = await prisma.socialLink.create({
    data: {
      platform: body.platform,
      label,
      url,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
      enabled: true,
    },
  });

  return cmsMutationResponse({ item });
}
