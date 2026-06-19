import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, jsonError } from "@/lib/admin-api";
import { slugify } from "@/lib/slug";
import { revalidateStoreCache } from "@/lib/revalidate-store";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  return withAuth(async () => {
    const { id } = await params;
    const body = await request.json();
    const { name, nameBn, slug, image } = body;

    if (!name || !nameBn) return jsonError("নাম প্রয়োজন");

    const finalSlug = slug || slugify(name);
    const duplicate = await prisma.category.findFirst({
      where: { slug: finalSlug, NOT: { id } },
    });
    if (duplicate) return jsonError("এই স্লাগ ইতিমধ্যে আছে");

    const category = await prisma.category.update({
      where: { id },
      data: { name, nameBn, slug: finalSlug, image: image || null },
    });
    revalidateStoreCache("categories");
    return NextResponse.json(category);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withAuth(async () => {
    const { id } = await params;
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      return jsonError("এই ক্যাটাগরিতে পণ্য আছে, মুছা যাবে না");
    }
    await prisma.category.delete({ where: { id } });
    revalidateStoreCache("categories");
    return NextResponse.json({ success: true });
  });
}
