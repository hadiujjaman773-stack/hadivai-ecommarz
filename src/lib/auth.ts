import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  getSession,
  setSessionCookie,
  clearSessionCookie,
  type SessionUser,
} from "@/lib/session";

export type { SessionUser } from "@/lib/session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser) {
  await setSessionCookie(user);
}

export async function destroySession() {
  await clearSessionCookie();
}

export { getSession };

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function requireSuperAdmin(): Promise<SessionUser> {
  const session = await requireSession();
  if (session.role !== "SUPER_ADMIN") throw new Error("Forbidden");
  return session;
}

export async function loginUser(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
