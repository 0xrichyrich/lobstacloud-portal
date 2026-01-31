import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getDb } from "./db";
import crypto from "crypto";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me"
);
const COOKIE_NAME = "lobsta_session";
const SESSION_DURATION = 30 * 24 * 60 * 60; // 30 days in seconds

export interface SessionPayload {
  email: string;
  customerIds: string[];
  exp: number;
}

export async function createSession(
  email: string,
  customerIds: string[]
): Promise<string> {
  const token = await new SignJWT({ email, customerIds })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${SESSION_DURATION}s`)
    .setIssuedAt()
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });

  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Magic link helpers
export async function createMagicLink(email: string): Promise<string> {
  const sql = getDb();
  const token = crypto.randomBytes(32).toString("hex");
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  await sql`
    INSERT INTO portal_sessions (id, email, token, expires_at)
    VALUES (${id}, ${email.toLowerCase()}, ${token}, ${expiresAt.toISOString()})
  `;

  return token;
}

export async function verifyMagicToken(
  token: string
): Promise<{ email: string } | null> {
  const sql = getDb();

  const rows = await sql`
    SELECT id, email, expires_at, verified
    FROM portal_sessions
    WHERE token = ${token}
    LIMIT 1
  `;

  if (rows.length === 0) return null;

  const session = rows[0];
  if (session.verified) return null;
  if (new Date(session.expires_at) < new Date()) return null;

  // Mark as verified
  await sql`
    UPDATE portal_sessions
    SET verified = true
    WHERE id = ${session.id}
  `;

  return { email: session.email };
}
