import "server-only";

import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "@/lib/auth/session";
import { USER_ROLES, type UserRole } from "@/lib/db/constants";

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(role: UserRole): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.role !== role) redirect("/");
  return session;
}

export async function requireAdmin(): Promise<SessionPayload> {
  return requireRole(USER_ROLES.ADMIN);
}

export async function requireVendor(): Promise<SessionPayload> {
  return requireRole(USER_ROLES.VENDOR);
}

export async function requireBuyer(): Promise<SessionPayload> {
  return requireRole(USER_ROLES.BUYER);
}

export async function requireDeliveryAgent(): Promise<SessionPayload> {
  return requireRole(USER_ROLES.DELIVERY_AGENT);
}
