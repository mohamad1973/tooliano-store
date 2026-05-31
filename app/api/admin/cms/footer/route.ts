import { prisma } from "@/lib/db/prisma";
import { requireApiAdmin, isSessionResponse } from "@/lib/auth/api-session";
import { cmsMutationResponse, parseBody } from "@/lib/cms/admin-api";

export async function GET() {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const columns = await prisma.footerColumn.findMany({
    orderBy: { sortOrder: "asc" },
    include: { links: { orderBy: { sortOrder: "asc" } } },
  });
  return Response.json({ columns });
}

export async function PUT(request: Request) {
  const session = await requireApiAdmin();
  if (isSessionResponse(session)) return session;

  const body = await parseBody<{
    columns: {
      id?: string;
      title: string;
      sortOrder: number;
      links: {
        id?: string;
        label: string;
        href: string;
        sortOrder: number;
        external: boolean;
      }[];
    }[];
  }>(request);
  if (body instanceof Response) return body;

  await prisma.$transaction(async (tx) => {
    await tx.footerLink.deleteMany();
    await tx.footerColumn.deleteMany();

    for (const col of body.columns ?? []) {
      await tx.footerColumn.create({
        data: {
          title: col.title,
          sortOrder: col.sortOrder,
          links: {
            create: col.links.map((l) => ({
              label: l.label,
              href: l.href,
              sortOrder: l.sortOrder,
              external: l.external,
            })),
          },
        },
      });
    }
  });

  return cmsMutationResponse();
}
