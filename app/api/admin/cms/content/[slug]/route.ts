import { prisma } from "@/lib/db/prisma";
import { requireApiAdmin, isSessionResponse } from "@/lib/auth/api-session";
import { cmsMutationResponse, parseBody } from "@/lib/cms/admin-api";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const { slug } = await params;
  const block = await prisma.contentBlock.findUnique({ where: { slug } });
  if (!block) {
    return Response.json({ error: "محتوى غير موجود" }, { status: 404 });
  }
  return Response.json({
    slug: block.slug,
    title: block.title,
    body: block.body,
  });
}

export async function PUT(request: Request, { params }: Params) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const { slug } = await params;
  const body = await parseBody<{ title: string; body: string }>(request);
  if (body instanceof Response) return body;

  if (!body.title?.trim() || !body.body?.trim()) {
    return Response.json({ error: "العنوان والمحتوى مطلوبان" }, { status: 400 });
  }

  try {
    JSON.parse(body.body);
  } catch {
    return Response.json({ error: "المحتوى يجب أن يكون JSON صالحاً" }, {
      status: 400,
    });
  }

  await prisma.contentBlock.upsert({
    where: { slug },
    create: {
      slug,
      title: body.title.trim(),
      body: body.body,
    },
    update: {
      title: body.title.trim(),
      body: body.body,
    },
  });

  return cmsMutationResponse();
}
