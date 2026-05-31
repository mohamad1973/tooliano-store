import { revalidateCms } from "@/lib/cms/revalidate";

export function cmsMutationResponse(data: object = { ok: true }) {
  revalidateCms();
  return Response.json(data);
}

export async function parseBody<T>(request: Request): Promise<T | Response> {
  try {
    return (await request.json()) as T;
  } catch {
    return Response.json({ error: "طلب غير صالح" }, { status: 400 });
  }
}
