import "server-only";

import { getSession, type SessionPayload } from "@/lib/auth/session";
import { USER_ROLES, type UserRole } from "@/lib/db/constants";

export async function requireApiSession(): Promise<
  SessionPayload | Response
> {
  const session = await getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "يجب تسجيل الدخول" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session;
}

export async function requireApiRole(
  role: UserRole,
): Promise<SessionPayload | Response> {
  const session = await requireApiSession();
  if (session instanceof Response) return session;
  if (session.role !== role) {
    return new Response(JSON.stringify({ error: "غير مصرح" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session;
}

export async function requireApiBuyer(): Promise<SessionPayload | Response> {
  return requireApiRole(USER_ROLES.BUYER);
}

export async function requireApiDeliveryAgent(): Promise<
  SessionPayload | Response
> {
  return requireApiRole(USER_ROLES.DELIVERY_AGENT);
}

export async function requireApiAdmin(): Promise<SessionPayload | Response> {
  return requireApiRole(USER_ROLES.ADMIN);
}

export function isSessionResponse(
  v: SessionPayload | Response,
): v is Response {
  return v instanceof Response;
}
