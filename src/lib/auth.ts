import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getDb } from "./db";
import crypto from "crypto";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me"
);
const COOKIE_NAME = "lobsta_session";
// H-6 FIX: Reduced session duration from 30 days to 24 hours
const SESSION_DURATION = 24 * 60 * 60; // 24 hours in seconds

// M-3 FIX: Warn if Redis is not configured in production
if (process.env.NODE_ENV === 'production' && !process.env.UPSTASH_REDIS_REST_URL) {
  console.error('⚠️ SECURITY: UPSTASH_REDIS_REST_URL not set in production. Token blacklisting (logout/revocation) will not work. Set Redis credentials for production deployments.');
}
if (process.env.JWT_SECRET === 'fallback-secret-change-me' || !process.env.JWT_SECRET) {
  console.error('⚠️ SECURITY: JWT_SECRET not set or using fallback. Set a strong random secret for production.');
}

// H-6 FIX: Token blacklist via Redis for logout/revocation
async function getRedis(): Promise<{ get: (key: string) => Promise<string | null>; set: (key: string, value: string, opts: { ex: number }) => Promise<void> } | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  
  return {
    async get(key: string) {
      const res = await fetch(`${url}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(['GET', key]),
      });
      const data = await res.json();
      return data.result;
    },
    async set(key: string, value: string, opts: { ex: number }) {
      await fetch(`${url}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(['SET', key, value, 'EX', opts.ex.toString()]),
      });
    },
  };
}

async function isTokenBlacklisted(jti: string): Promise<boolean> {
  try {
    const redis = await getRedis();
    if (!redis) return false;
    const result = await redis.get(`lobsta:blacklist:${jti}`);
    return result === '1';
  } catch {
    return false;
  }
}

export async function blacklistToken(jti: string, ttlSeconds: number = SESSION_DURATION): Promise<void> {
  try {
    const redis = await getRedis();
    if (!redis) return;
    await redis.set(`lobsta:blacklist:${jti}`, '1', { ex: ttlSeconds });
  } catch (err) {
    console.error('[Auth] Failed to blacklist token:', err);
  }
}

export interface SessionPayload {
  email: string;
  customerIds: string[];
  exp: number;
  jti?: string; // H-6 FIX: Token ID for blacklisting
}

export async function createSession(
  email: string,
  customerIds: string[]
): Promise<string> {
  // H-6 FIX: Include jti for token blacklisting on logout
  const jti = crypto.randomUUID();
  const token = await new SignJWT({ email, customerIds, jti })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${SESSION_DURATION}s`)
    .setIssuedAt()
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict", // Upgraded from lax to strict for CSRF protection
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
    
    // H-6 FIX: Check blacklist for revoked tokens
    if (payload.jti) {
      const blacklisted = await isTokenBlacklisted(payload.jti as string);
      if (blacklisted) return null;
    }
    
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// H-6 FIX: Extract jti from token for blacklisting during logout
export async function getTokenJti(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return (payload.jti as string) || null;
  } catch {
    return null;
  }
}

export async function destroySession() {
  // H-6 FIX: Blacklist the token before destroying the cookie
  try {
    const jti = await getTokenJti();
    if (jti) {
      await blacklistToken(jti, SESSION_DURATION);
    }
  } catch (err) {
    console.error('[Auth] Error blacklisting token during logout:', err);
  }
  
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
