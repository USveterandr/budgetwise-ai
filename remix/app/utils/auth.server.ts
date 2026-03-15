import type { AppLoadContext } from "@remix-run/cloudflare";
import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();

export class UnauthorizedError extends Error {
  status = 401;
  constructor(message = "Unauthorized") {
    super(message);
  }
}

type Env = AppLoadContext["env"];

export async function hashPassword(password: string) {
  const encoded = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createToken(userId: string, env: Env) {
  const secret = encoder.encode(env.JWT_SECRET);
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string, env: Env) {
  const secret = encoder.encode(env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE
  });
  if (!payload.sub) {
    throw new UnauthorizedError();
  }
  return payload.sub as string;
}

export async function requireUserId(request: Request, env: Env) {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedError();
  }
  const token = header.replace("Bearer ", "").trim();
  try {
    return await verifyToken(token, env);
  } catch (error) {
    console.error("JWT verification failed", error);
    throw new UnauthorizedError();
  }
}
