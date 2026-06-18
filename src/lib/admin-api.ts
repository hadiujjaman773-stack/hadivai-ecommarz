import { NextResponse } from "next/server";
import { getSession, requireSession, requireSuperAdmin } from "@/lib/auth";
import { isInventoryEnabled } from "@/lib/feature-flags";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function withAuth<T>(
  handler: (session: NonNullable<Awaited<ReturnType<typeof getSession>>>) => Promise<T>
) {
  try {
    const session = await requireSession();
    return await handler(session);
  } catch {
    return jsonError("Unauthorized", 401);
  }
}

export async function withInventoryAuth<T>(
  handler: (session: NonNullable<Awaited<ReturnType<typeof getSession>>>) => Promise<T>
) {
  if (!isInventoryEnabled()) {
    return jsonError("ইনভেন্টরি মডিউল নিষ্ক্রিয়", 404);
  }
  return withAuth(handler);
}

export async function withSuperAdmin<T>(
  handler: (session: NonNullable<Awaited<ReturnType<typeof getSession>>>) => Promise<T>
) {
  try {
    const session = await requireSuperAdmin();
    return await handler(session);
  } catch (err) {
    if (err instanceof Error && err.message === "Forbidden") {
      return jsonError("Forbidden", 403);
    }
    return jsonError("Unauthorized", 401);
  }
}
