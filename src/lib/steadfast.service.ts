import { prisma } from "@/lib/prisma";
import { isValidBdMobile } from "@/lib/bd-phone";
import {
  buildSteadfastPayload,
  createSteadfastOrder,
  getSteadfastStatusByConsignmentId,
  getSteadfastStatusByInvoice,
  getSteadfastStatusByTrackingCode,
  isSteadfastConfigured,
} from "@/lib/steadfast";

type OrderRow = {
  id: string;
  orderNumber: string;
  fullName: string;
  email: string | null;
  phone: string;
  address: string;
  city: string;
  district: string | null;
  note: string | null;
  total: number;
  items: unknown;
  isCustom: boolean;
  steadfastConsignmentId: string | null;
  steadfastTrackingCode: string | null;
};

export function canSendToSteadfast(order: OrderRow): {
  ok: boolean;
  reason?: string;
} {
  if (!isSteadfastConfigured()) {
    return { ok: false, reason: "Steadfast API কনফিগার করা নেই" };
  }
  if (order.steadfastConsignmentId || order.steadfastTrackingCode) {
    return { ok: false, reason: "এই অর্ডার ইতিমধ্যে Steadfast-এ পাঠানো হয়েছে" };
  }
  if (!order.fullName?.trim()) {
    return { ok: false, reason: "গ্রাহকের নাম প্রয়োজন" };
  }
  if (!isValidBdMobile(order.phone)) {
    return { ok: false, reason: "সঠিক বাংলাদেশি মোবাইল নম্বর (01XXXXXXXXX) প্রয়োজন" };
  }
  const address = [order.address, order.city, order.district]
    .filter(Boolean)
    .join(", ");
  if (address.trim().length < 10) {
    return { ok: false, reason: "ঠিকানা কমপক্ষে ১০ অক্ষর হতে হবে" };
  }
  return { ok: true };
}

export async function createParcelForOrder(
  orderId: string,
  extraNote?: string
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new Error("অর্ডার পাওয়া যায়নি");
  }

  const check = canSendToSteadfast(order);
  if (!check.ok) {
    throw new Error(check.reason || "Steadfast-এ পাঠানো যাবে না");
  }

  const payload = buildSteadfastPayload({
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
    extraNote,
  });

  try {
    const result = await createSteadfastOrder(payload);
    const now = new Date();

    return await prisma.order.update({
      where: { id: order.id },
      data: {
        steadfastConsignmentId: String(result.consignment_id ?? ""),
        steadfastTrackingCode: result.tracking_code ?? "",
        steadfastDeliveryStatus: result.status ?? "in_review",
        steadfastLastError: null,
        steadfastCreatedAt: now,
        steadfastSyncedAt: now,
        status: "courier",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Steadfast ত্রুটি";
    await prisma.order.update({
      where: { id: order.id },
      data: { steadfastLastError: message },
    });
    throw new Error(message);
  }
}

export async function syncDeliveryStatusForOrder(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new Error("অর্ডার পাওয়া যায়নি");
  }
  if (!order.steadfastConsignmentId && !order.steadfastTrackingCode) {
    throw new Error("এই অর্ডার Steadfast-এ পাঠানো হয়নি");
  }

  let deliveryStatus: string | null = null;

  try {
    if (order.steadfastTrackingCode) {
      deliveryStatus = await getSteadfastStatusByTrackingCode(
        order.steadfastTrackingCode
      );
    } else if (order.steadfastConsignmentId) {
      deliveryStatus = await getSteadfastStatusByConsignmentId(
        order.steadfastConsignmentId
      );
    } else {
      deliveryStatus = await getSteadfastStatusByInvoice(order.orderNumber);
    }

    return await prisma.order.update({
      where: { id: order.id },
      data: {
        steadfastDeliveryStatus: deliveryStatus,
        steadfastSyncedAt: new Date(),
        steadfastLastError: null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "স্ট্যাটাস সিঙ্ক ব্যর্থ";
    await prisma.order.update({
      where: { id: order.id },
      data: { steadfastLastError: message },
    });
    throw new Error(message);
  }
}

/** @deprecated use createParcelForOrder */
export const sendOrderToSteadfast = createParcelForOrder;

/** @deprecated use syncDeliveryStatusForOrder */
export const syncSteadfastDeliveryStatus = syncDeliveryStatusForOrder;

export const SteadfastServices = {
  isConfigured: isSteadfastConfigured,
  canSendToSteadfast,
  createParcelForOrder,
  syncDeliveryStatusForOrder,
};
