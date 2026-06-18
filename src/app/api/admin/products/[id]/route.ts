import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, jsonError } from "@/lib/admin-api";
import { slugify } from "@/lib/slug";
import {
  DEFAULT_PRODUCT_UNIT,
  isValidProductUnit,
} from "@/lib/product-units";
import { parseVariants } from "@/lib/product-variants";
import { syncProductStockFields } from "@/lib/inventory";

type Params = { params: Promise<{ id: string }> };

function resolveSlug(slug: string | undefined, titleBn: string, title: string) {
  const raw = slug?.trim() || slugify(titleBn || title);
  return raw || slugify(`product-${Date.now()}`);
}

export async function GET(_request: Request, { params }: Params) {
  return withAuth(async () => {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) return jsonError("পণ্য পাওয়া যায়নি", 404);
    return NextResponse.json(product);
  });
}

export async function PUT(request: Request, { params }: Params) {
  return withAuth(async () => {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      titleBn,
      slug,
      description,
      descriptionBn,
      price,
      comparePrice,
      images,
      variants,
      unit,
      categoryId,
      shippingFree,
      featured,
      inStock,
      stock,
    } = body;

    if (!title || !titleBn || !categoryId || price === undefined) {
      return jsonError("শিরোনাম, ক্যাটাগরি ও মূল্য প্রয়োজন");
    }

    const finalSlug = resolveSlug(slug, titleBn, title);
    const duplicate = await prisma.product.findFirst({
      where: { categoryId, slug: finalSlug, NOT: { id } },
    });
    if (duplicate) return jsonError("এই ক্যাটাগরিতে স্লাগ ইতিমধ্যে আছে");

    const parsedVariants = parseVariants(variants);
    const synced = syncProductStockFields(Number(stock) || 0, parsedVariants);
    const discount =
      comparePrice && comparePrice > price
        ? Math.round(((comparePrice - price) / comparePrice) * 100)
        : null;

    const product = await prisma.product.update({
      where: { id },
      data: {
        title,
        titleBn,
        slug: finalSlug,
        description: description || null,
        descriptionBn: descriptionBn || null,
        price: Number(price),
        comparePrice: comparePrice ? Number(comparePrice) : null,
        discount,
        images: images || [],
        variants: synced.variants as object,
        unit: isValidProductUnit(unit) ? unit : DEFAULT_PRODUCT_UNIT,
        categoryId,
        shippingFree: shippingFree === true,
        featured: featured === true,
        stock: synced.stock,
        inStock: synced.inStock,
      },
      include: { category: true },
    });
    return NextResponse.json(product);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withAuth(async () => {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  });
}
