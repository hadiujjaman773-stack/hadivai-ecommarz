import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, jsonError } from "@/lib/admin-api";
import {
  bulkCreateSteadfastOrders,
  buildSteadfastPayload,
  isSteadfastConfigured,
} from "@/lib/steadfast";

export async function POST(request: Request) {
  return withAuth(async () => {
    if (!isSteadfastConfigured()) {
      return jsonError("Steadfast API কনফিগার করা নেই", 503);
    }

    const body = await request.json().catch(() => ({}));
    const orderIds = Array.isArray(body.orderIds) ? body.orderIds : [];

    if (orderIds.length === 0) {
      return jsonError("অন্তত একটি অর্ডার নির্বাচন করুন");
    }
    if (orderIds.length > 500) {
      return jsonError("একবারে সর্বোচ্চ ৫০০টি অর্ডার");
    }

    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
    });

    const eligible = orders.filter((o) => !o.steadfastConsignmentId);
    if (eligible.length === 0) {
      return jsonError("নির্বাচিত অর্ডারগুলো ইতিমধ্যে Steadfast-এ পাঠানো হয়েছে");
    }

    const payloads = eligible.map((order) =>
      buildSteadfastPayload({
        orderNumber: order.orderNumber,
        fullName: order.fullName,
        phone: order.phone,
        email: order.email,
        address: order.address,
        city: order.city,
        district: order.district,
        note: order.note,
        total: order.total,
        items: order.items,
      })
    );

    try {
      const results = await bulkCreateSteadfastOrders(payloads);
      const byInvoice = new Map(results.map((r) => [r.invoice, r]));

      const updated = await Promise.all(
        eligible.map(async (order) => {
          const result = byInvoice.get(order.orderNumber);
          if (!result || result.status === "error") {
            return {
              id: order.id,
              orderNumber: order.orderNumber,
              success: false,
              error: result?.status === "error" ? "Steadfast ত্রুটি" : "ফলাফল পাওয়া যায়নি",
            };
          }

          const now = new Date();
          const saved = await prisma.order.update({
            where: { id: order.id },
            data: {
              steadfastConsignmentId: String(result.consignment_id ?? ""),
              steadfastTrackingCode: result.tracking_code ?? "",
              steadfastDeliveryStatus: "in_review",
              steadfastLastError: null,
              steadfastCreatedAt: now,
              steadfastSyncedAt: now,
              status: "courier",
            },
          });

          return {
            id: saved.id,
            orderNumber: saved.orderNumber,
            success: true,
            trackingCode: saved.steadfastTrackingCode,
          };
        })
      );

      const successCount = updated.filter((u) => u.success).length;
      return NextResponse.json({
        message: `${successCount}/${eligible.length} অর্ডার Steadfast-এ পাঠানো হয়েছে`,
        results: updated,
      });
    } catch (err) {
      return jsonError(
        err instanceof Error ? err.message : "Bulk Steadfast ত্রুটি",
        500
      );
    }
  });
}
