import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withSuperAdmin, jsonError } from "@/lib/admin-api";
import { hashPassword } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withSuperAdmin(async (session) => {
    const { id } = await params;
    const body = await request.json();
    const { name, role, active, password } = body;

    if (id === session.id && active === false) {
      return jsonError("নিজের অ্যাকাউন্ট নিষ্ক্রিয় করা যাবে না");
    }

    const data: {
      name?: string;
      role?: "SUPER_ADMIN" | "ADMIN";
      active?: boolean;
      passwordHash?: string;
    } = {};

    if (name) data.name = name;
    if (role) data.role = role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";
    if (active !== undefined) data.active = active;
    if (password) {
      if (password.length < 6) return jsonError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর");
      data.passwordHash = await hashPassword(password);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });
    return NextResponse.json(user);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withSuperAdmin(async (session) => {
    const { id } = await params;
    if (id === session.id) {
      return jsonError("নিজের অ্যাকাউন্ট মুছা যাবে না");
    }
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  });
}
