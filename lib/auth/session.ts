import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { UserRole } from "@/lib/db/constants";

const COOKIE_NAME = "tooliano_session";

export type SessionPayload = {
  userId: string;
  username: string;
  role: UserRole;
};

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET must be set (min 16 chars) in .env.local");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT({
    userId: payload.userId,
    username: payload.username,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const userId = payload.userId;
    const username = payload.username;
    const role = payload.role;
    if (
      typeof userId !== "string" ||
      typeof username !== "string" ||
      typeof role !== "string"
    ) {
      return null;
    }
    return { userId, username, role: role as UserRole };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
