import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withSuperAdmin, jsonError } from "@/lib/admin-api";
import { hashPassword } from "@/lib/auth";
import { paginateArray, parsePaginationParams } from "@/lib/pagination";

export async function GET(request: Request) {
  return withSuperAdmin(async () => {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");

    let users = await prisma.user.findMany({
      where: role ? { role: role as "SUPER_ADMIN" | "ADMIN" } : undefined,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });

    if (search?.trim()) {
      const term = search.trim().toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
      );
    }

    const { page, pageSize } = parsePaginationParams(searchParams);
    return NextResponse.json(paginateArray(users, page, pageSize));
  });
}

export async function POST(request: Request) {
  return withSuperAdmin(async () => {
    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name) {
      return jsonError("ইমেইল, পাসওয়ার্ড ও নাম প্রয়োজন");
    }

    if (password.length < 6) {
      return jsonError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর");
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (existing) return jsonError("এই ইমেইল ইতিমধ্যে আছে");

    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash: await hashPassword(password),
        name,
        role: role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });
    return NextResponse.json(user, { status: 201 });
  });
}
