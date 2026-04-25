import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export type AuthTokenPayload = {
  id: number;
  email: string;
  role: string;
};

export function getTokenFromRequest(request: NextRequest | Request) {
  if (request instanceof NextRequest) {
    return request.cookies.get("token")?.value || null;
  }
  // For standard Request, get from headers
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies.token || null;
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
}

export function getUserFromRequest(request: NextRequest | Request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(request: NextRequest | Request) {
  const user = getUserFromRequest(request);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export function requireRole(request: NextRequest | Request, roles: string[]) {
  const user = requireAuth(request);
  if (!roles.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}
