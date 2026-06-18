import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, jsonError } from "@/lib/admin-api";
import { isValidOrderStatus, normalizeOrderStatus } from "@/lib/order-status";
import {
  buildSteadfastPayload,
  createSteadfastOrder,
} from "@/lib/steadfast";
import {
  parseOrderItems,
  restoreStockForOrder,
} from "@/lib/inventory";
import { isInventoryEnabled } from "@/lib/feature-flags";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  return withAuth(async () => {
    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return jsonError("অর্ডার পাওয়া যায়নি", 404);

    const ipBlocked = order.clientIp
      ? !!(await prisma.blockedIp.findUnique({
          where: { ip: order.clientIp },
        }))
      : false;

    return NextResponse.json({ ...order, ipBlocked });
  });
}

export async function PUT(request: Request, { params }: Params) {
  return withAuth(async () => {
    const { id } = await params;
    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      address,
      city,
      district,
      note,
      items,
      subtotal,
      shipping,
      total,
      status,
    } = body;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return jsonError("অর্ডার পাওয়া যায়নি", 404);

    if (status && !isValidOrderStatus(status)) {
      return jsonError("অবৈধ স্ট্যাটাস");
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        fullName: fullName ?? existing.fullName,
        email: email !== undefined ? email?.trim() || null : existing.email,
        phone: phone ?? existing.phone,
        address: address ?? existing.address,
        city: city ?? existing.city,
        district: district !== undefined ? district || null : existing.district,
        note: note !== undefined ? note || null : existing.note,
        items: items ?? existing.items,
        subtotal: subtotal !== undefined ? Number(subtotal) : existing.subtotal,
        shipping: shipping !== undefined ? Number(shipping) : existing.shipping,
        total: total !== undefined ? Number(total) : existing.total,
        status: status ? normalizeOrderStatus(status) : existing.status,
      },
    });

    return NextResponse.json(order);
  });
}

export async function PATCH(request: Request, { params }: Params) {
  return withAuth(async () => {
    const { id } = await params;
    const body = await request.json();
    const { status, sendToSteadfast } = body;

    if (!status || !isValidOrderStatus(status)) {
      return jsonError("অবৈধ স্ট্যাটাস");
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return jsonError("অর্ডার পাওয়া যায়নি", 404);

    let steadfastConsignmentId = existing.steadfastConsignmentId;
    let steadfastTrackingCode = existing.steadfastTrackingCode;

    if (status === "courier" && sendToSteadfast) {
      try {
        const payload = buildSteadfastPayload({
          orderNumber: existing.orderNumber,
          fullName: existing.fullName,
          phone: existing.phone,
          address: existing.address,
          city: existing.city,
          note: existing.note,
          total: existing.total,
          items: existing.items,
        });
        const result = await createSteadfastOrder(payload);
        steadfastConsignmentId = String(result.consignment_id ?? "");
        steadfastTrackingCode = result.tracking_code ?? "";
      } catch (err) {
        return jsonError(
          err instanceof Error ? err.message : "Steadfast ত্রুটি",
          500
        );
      }
    }

    const normalized = normalizeOrderStatus(status);
    const shouldRestore =
      isInventoryEnabled() &&
      (normalized === "cancel" || normalized === "return") &&
      existing.stockDeducted &&
      !existing.stockRestored;

    if (shouldRestore) {
      try {
        await restoreStockForOrder(
          existing.id,
          parseOrderItems(existing.items),
          normalized === "return" ? "return" : "cancel"
        );
      } catch (err) {
        return jsonError(
          err instanceof Error ? err.message : "স্টক পুনরুদ্ধার ব্যর্থ",
          500
        );
      }
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: normalized,
        steadfastConsignmentId,
        steadfastTrackingCode,
        ...(shouldRestore ? { stockRestored: true } : {}),
      },
    });

    return NextResponse.json(order);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withAuth(async () => {
    const { id } = await params;
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return jsonError("অর্ডার পাওয়া যায়নি", 404);

    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ success: true });
  });
}
