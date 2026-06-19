import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export function getDefaultAdminEmail(): string {
  const raw =
    process.env.ADMIN_EMAIL ||
    process.env.Email ||
    "admin@mosafamart.com";
  return raw.replace(/^["']|["']$/g, "").trim().toLowerCase();
}

export function getDefaultAdminPassword(): string {
  const raw = process.env.ADMIN_PASSWORD || "admin123";
  return raw.replace(/^["']|["']$/g, "").trim();
}

/** Create default super admin if missing (new DB / first deploy). */
export async function ensureDefaultAdmin() {
  const email = getDefaultAdminEmail();
  const password = getDefaultAdminPassword();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  return prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      name: "Super Admin",
      role: "SUPER_ADMIN",
      active: true,
    },
  });
}
