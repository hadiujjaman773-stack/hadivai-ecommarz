import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withInventoryAuth, jsonError } from "@/lib/admin-api";
import { adjustProductStock } from "@/lib/inventory";
import { revalidateStoreCache } from "@/lib/revalidate-store";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  return withInventoryAuth(async () => {
    const { id } = await params;
    const body = await request.json();
    const { status, refundAmount, note, reason } = body;

    const existing = await prisma.productReturn.findUnique({ where: { id } });
    if (!existing) return jsonError("রিটার্ন পাওয়া যায়নি", 404);

    if (status === "approved" && existing.status !== "approved") {
      try {
        await adjustProductStock({
          productId: existing.productId,
          variantId: existing.variantId ?? undefined,
          quantity: existing.quantity,
          direction: "in",
          type: "return",
          returnId: existing.id,
          note: reason || existing.reason || "রিটার্ন অনুমোদিত",
        });
        revalidateStoreCache("products");
      } catch (err) {
        return jsonError(
          err instanceof Error ? err.message : "স্টক আপডেট ব্যর্থ"
        );
      }
    }

    const updated = await prisma.productReturn.update({
      where: { id },
      data: {
        status: status ?? existing.status,
        refundAmount:
          refundAmount !== undefined ? Number(refundAmount) : existing.refundAmount,
        note: note !== undefined ? note : existing.note,
        reason: reason !== undefined ? reason : existing.reason,
      },
    });

    return NextResponse.json(updated);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withInventoryAuth(async () => {
    const { id } = await params;
    const existing = await prisma.productReturn.findUnique({ where: { id } });
    if (!existing) return jsonError("রিটার্ন পাওয়া যায়নি", 404);
    if (existing.status === "approved") {
      return jsonError("অনুমোদিত রিটার্ন মুছা যাবে না");
    }
    await prisma.productReturn.delete({ where: { id } });
    return NextResponse.json({ success: true });
  });
}
