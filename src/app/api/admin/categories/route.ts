import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, jsonError } from "@/lib/admin-api";
import { paginateArray, parsePaginationParams } from "@/lib/pagination";
import { slugify } from "@/lib/slug";

function filterBySearch<
  T extends { name: string; nameBn: string; slug: string },
>(items: T[], search: string | null) {
  if (!search?.trim()) return items;
  const term = search.trim().toLowerCase();
  return items.filter(
    (i) =>
      i.name.toLowerCase().includes(term) ||
      i.nameBn.toLowerCase().includes(term) ||
      i.slug.toLowerCase().includes(term)
  );
}

export async function GET(request: Request) {
  return withAuth(async () => {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const categories = await prisma.category.findMany({
      orderBy: { nameBn: "asc" },
      include: { _count: { select: { products: true } } },
    });

    const filtered = filterBySearch(categories, search);

    if (searchParams.get("all") === "true") {
      return NextResponse.json(filtered);
    }

    const { page, pageSize } = parsePaginationParams(searchParams);
    return NextResponse.json(paginateArray(filtered, page, pageSize));
  });
}

export async function POST(request: Request) {
  return withAuth(async () => {
    const body = await request.json();
    const { name, nameBn, slug, image } = body;

    if (!name || !nameBn) {
      return jsonError("নাম প্রয়োজন");
    }

    const finalSlug = slug || slugify(name);
    const existing = await prisma.category.findUnique({
      where: { slug: finalSlug },
    });
    if (existing) return jsonError("এই স্লাগ ইতিমধ্যে আছে");

    const category = await prisma.category.create({
      data: { name, nameBn, slug: finalSlug, image: image || null },
    });
    return NextResponse.json(category, { status: 201 });
  });
}
