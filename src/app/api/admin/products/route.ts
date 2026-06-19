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
import { paginateArray, parsePaginationParams } from "@/lib/pagination";
import { revalidateStoreCache } from "@/lib/revalidate-store";

function filterProducts(
  products: Array<{ title: string; titleBn: string; slug: string }>,
  search: string | null
) {
  if (!search?.trim()) return products;
  const term = search.trim().toLowerCase();
  return products.filter(
    (p) =>
      p.title.toLowerCase().includes(term) ||
      p.titleBn.toLowerCase().includes(term) ||
      p.slug.toLowerCase().includes(term)
  );
}

function resolveSlug(slug: string | undefined, titleBn: string, title: string) {
  const raw = slug?.trim() || slugify(titleBn || title);
  return raw || slugify(`product-${Date.now()}`);
}

export async function GET(request: Request) {
  return withAuth(async () => {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const inStock = searchParams.get("inStock");

    const products = await prisma.product.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(inStock === "true"
          ? { inStock: true }
          : inStock === "false"
            ? { inStock: false }
            : {}),
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    const filtered = filterProducts(products, search);

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
    const existing = await prisma.product.findUnique({
      where: { categoryId_slug: { categoryId, slug: finalSlug } },
    });
    if (existing) return jsonError("এই ক্যাটাগরিতে স্লাগ ইতিমধ্যে আছে");

    const parsedVariants = parseVariants(variants);
    const synced = syncProductStockFields(Number(stock) || 0, parsedVariants);
    const discount =
      comparePrice && comparePrice > price
        ? Math.round(((comparePrice - price) / comparePrice) * 100)
        : null;

    const product = await prisma.product.create({
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
    revalidateStoreCache("products");
    return NextResponse.json(product, { status: 201 });
  });
}
