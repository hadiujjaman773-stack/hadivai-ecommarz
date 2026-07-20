import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withInventoryAuth, jsonError } from "@/lib/admin-api";
import {
  adjustProductStock,
  STOCK_MOVEMENT_TYPES,
  type StockMovementType,
} from "@/lib/inventory";
import { paginateArray, parsePaginationParams } from "@/lib/pagination";
import { revalidateStoreCache } from "@/lib/revalidate-store";

export async function GET(request: Request) {
  return withInventoryAuth(async () => {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const type = searchParams.get("type");

    const movements = await prisma.stockMovement.findMany({
      where: {
        ...(productId ? { productId } : {}),
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    const { page, pageSize } = parsePaginationParams(searchParams);
    return NextResponse.json(paginateArray(movements, page, pageSize));
  });
}

export async function POST(request: Request) {
  return withInventoryAuth(async () => {
    const body = await request.json();
    const { productId, variantId, quantity, direction, type, note } = body;

    if (!productId || !quantity || !direction || !type) {
      return jsonError("পণ্য, পরিমাণ, দিক ও ধরন প্রয়োজন");
    }

    if (!["in", "out"].includes(direction)) {
      return jsonError("অবৈধ দিক");
    }

    if (!(type in STOCK_MOVEMENT_TYPES)) {
      return jsonError("অবৈধ স্টক ধরন");
    }

    try {
      const result = await adjustProductStock({
        productId,
        variantId: variantId || undefined,
        quantity: Number(quantity),
        direction,
        type: type as StockMovementType,
        note,
      });
      revalidateStoreCache("products");
      return NextResponse.json(result, { status: 201 });
    } catch (err) {
      return jsonError(err instanceof Error ? err.message : "স্টক আপডেট ব্যর্থ");
    }
  });
}
