import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withInventoryAuth, jsonError } from "@/lib/admin-api";
import {
  adjustProductStock,
  generateReturnNumber,
} from "@/lib/inventory";
import { paginateArray, parsePaginationParams } from "@/lib/pagination";

export async function GET(request: Request) {
  return withInventoryAuth(async () => {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let returns = await prisma.productReturn.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    });

    if (search?.trim()) {
      const term = search.trim().toLowerCase();
      returns = returns.filter(
        (r) =>
          r.returnNumber.toLowerCase().includes(term) ||
          r.productName.toLowerCase().includes(term) ||
          (r.orderNumber?.toLowerCase().includes(term) ?? false)
      );
    }

    const { page, pageSize } = parsePaginationParams(searchParams);
    return NextResponse.json(paginateArray(returns, page, pageSize));
  });
}

export async function POST(request: Request) {
  return withInventoryAuth(async () => {
    const body = await request.json();
    const {
      orderId,
      orderNumber,
      productId,
      productName,
      variantId,
      variantName,
      quantity,
      unit,
      reason,
      refundAmount,
      note,
      status,
    } = body;

    if (!productId || !productName || !quantity) {
      return jsonError("পণ্য ও পরিমাণ প্রয়োজন");
    }

    const returnStatus = status || "pending";
    const record = await prisma.productReturn.create({
      data: {
        returnNumber: generateReturnNumber(),
        orderId: orderId || null,
        orderNumber: orderNumber || null,
        productId,
        productName,
        variantId: variantId || null,
        variantName: variantName || null,
        quantity: Number(quantity),
        unit: unit || "piece",
        reason: reason || null,
        refundAmount: Number(refundAmount) || 0,
        note: note || null,
        status: returnStatus,
      },
    });

    if (returnStatus === "approved") {
      try {
        await adjustProductStock({
          productId,
          variantId: variantId || undefined,
          quantity: Number(quantity),
          direction: "in",
          type: "return",
          returnId: record.id,
          note: reason || "পণ্য রিটার্ন",
        });
      } catch (err) {
        await prisma.productReturn.delete({ where: { id: record.id } });
        return jsonError(
          err instanceof Error ? err.message : "স্টক আপডেট ব্যর্থ"
        );
      }
    }

    return NextResponse.json(record, { status: 201 });
  });
}
