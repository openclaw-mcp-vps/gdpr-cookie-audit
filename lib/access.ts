import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const ACCESS_COOKIE_NAME = "gdpr_access_token";
const ACCESS_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 31;

function getSecret(): Uint8Array {
  const secret =
    process.env.STRIPE_WEBHOOK_SECRET ??
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
    "local-development-access-secret";

  return new TextEncoder().encode(secret);
}

export async function signAccessToken(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime("31d")
    .sign(getSecret());
}

export async function verifyAccessToken(token: string): Promise<{ email: string } | null> {
  try {
    const verified = await jwtVerify(token, getSecret());
    const email = verified.payload.email;
    if (typeof email !== "string") {
      return null;
    }
    return { email };
  } catch {
    return null;
  }
}

export async function getAccessFromCookie(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return verifyAccessToken(token);
}

export function getAccessCookieName(): string {
  return ACCESS_COOKIE_NAME;
}

export function getAccessCookieMaxAge(): number {
  return ACCESS_COOKIE_MAX_AGE_SECONDS;
}
