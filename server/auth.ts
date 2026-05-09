import { hash, compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { OAuth2Client } from "google-auth-library";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const SALT_ROUNDS = 10;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function verifyGoogleToken(idToken: string): Promise<{
  googleId: string;
  email: string;
  name: string;
  picture?: string;
} | null> {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) return null;
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name ?? payload.email.split("@")[0],
      picture: payload.picture,
    };
  } catch {
    return null;
  }
}

export interface SessionPayload {
  userId: number;
  openId: string;
  email: string;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashed: string
): Promise<boolean> {
  return compare(password, hashed);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const secret = getJwtSecret();
  const expiresInMs = ONE_YEAR_MS;
  const expirationSeconds = Math.floor((Date.now() + expiresInMs) / 1000);

  return new SignJWT({
    userId: payload.userId,
    openId: payload.openId,
    email: payload.email,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(secret);
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    const { userId, openId, email } = payload as Record<string, unknown>;
    if (
      typeof userId !== "number" ||
      typeof openId !== "string" ||
      typeof email !== "string"
    ) {
      return null;
    }

    return { userId, openId, email };
  } catch {
    return null;
  }
}

export function generateOpenId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
