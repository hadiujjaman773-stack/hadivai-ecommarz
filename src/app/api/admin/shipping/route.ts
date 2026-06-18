import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, jsonError } from "@/lib/admin-api";
import { paginateArray, parsePaginationParams } from "@/lib/pagination";

export async function GET(request: Request) {
  return withAuth(async () => {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const active = searchParams.get("active");

    let shipping = await prisma.shipping.findMany({
      where:
        active === "true"
          ? { active: true }
          : active === "false"
            ? { active: false }
            : undefined,
      orderBy: { createdAt: "desc" },
    });

    if (search?.trim()) {
      const term = search.trim().toLowerCase();
      shipping = shipping.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.nameBn.toLowerCase().includes(term)
      );
    }

    const { page, pageSize } = parsePaginationParams(searchParams);
    return NextResponse.json(paginateArray(shipping, page, pageSize));
  });
}

export async function POST(request: Request) {
  return withAuth(async () => {
    const body = await request.json();
    const { name, nameBn, price, active } = body;

    if (!name || !nameBn || price === undefined) {
      return jsonError("নাম ও মূল্য প্রয়োজন");
    }

    const item = await prisma.shipping.create({
      data: {
        name,
        nameBn,
        price: Number(price),
        active: active !== false,
      },
    });
    return NextResponse.json(item, { status: 201 });
  });
}
