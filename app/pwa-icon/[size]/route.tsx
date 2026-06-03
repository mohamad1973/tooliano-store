import { renderPwaIcon } from "@/lib/pwa/icon-image";

const ALLOWED = new Set(["192", "512", "180", "32"]);

type Params = { params: Promise<{ size: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { size: raw } = await params;
  if (!ALLOWED.has(raw)) {
    return new Response("Not found", { status: 404 });
  }
  const size = Number.parseInt(raw, 10);
  return renderPwaIcon(size);
}
