import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("category") ?? undefined;
  const featured = searchParams.get("featured");
  const limit = searchParams.get("limit");

  const products = await getProducts({
    categorySlug,
    featured: featured === "true" ? true : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });

  return NextResponse.json(products);
}
