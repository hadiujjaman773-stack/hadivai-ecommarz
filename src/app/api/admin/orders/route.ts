import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, jsonError } from "@/lib/admin-api";
import { isValidOrderStatus, statusFilterValues } from "@/lib/order-status";
import { getOrderDateRange } from "@/lib/date-filter";
import { paginateArray, parsePaginationParams } from "@/lib/pagination";
import { createOrderInDb } from "@/lib/db";

function generateOrderNumber() {
  return `MM${Date.now().toString(36).toUpperCase()}`;
}

function filterOrders<
  T extends {
    orderNumber: string;
    fullName: string;
    phone: string;
    address?: string;
  },
>(orders: T[], search: string | null) {
  if (!search?.trim()) return orders;
  const term = search.trim().toLowerCase();
  return orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(term) ||
      o.fullName.toLowerCase().includes(term) ||
      o.phone.includes(term) ||
      (o.address?.toLowerCase().includes(term) ?? false)
  );
}

export async function GET(request: Request) {
  return withAuth(async () => {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const isCustom = searchParams.get("isCustom");
    const today = searchParams.get("today") === "true";
    const date = searchParams.get("date");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const dateRange = getOrderDateRange({ today, date, dateFrom, dateTo });

    const orders = await prisma.order.findMany({
      where: {
        ...(status
          ? { status: { in: statusFilterValues(status) } }
          : {}),
        ...(isCustom === "true"
          ? { isCustom: true }
          : isCustom === "false"
            ? { isCustom: false }
            : {}),
        ...(dateRange
          ? { createdAt: { gte: dateRange.gte, lt: dateRange.lt } }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    const filtered = filterOrders(orders, search);
    const { page, pageSize } = parsePaginationParams(searchParams);
    return NextResponse.json(paginateArray(filtered, page, pageSize));
  });
}

export async function POST(request: Request) {
  return withAuth(async () => {
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

    if (!fullName || !phone || !address || !city) {
      return jsonError("নাম, ফোন, ঠিকানা ও শহর প্রয়োজন");
    }
    if (!items?.length) {
      return jsonError("অন্তত একটি পণ্য প্রয়োজন");
    }

    const orderStatus = status || "pending";
    if (!isValidOrderStatus(orderStatus)) {
      return jsonError("অবৈধ স্ট্যাটাস");
    }

    try {
      const order = await createOrderInDb({
        orderNumber: generateOrderNumber(),
        fullName,
        email: email?.trim() || undefined,
        phone,
        address,
        city,
        district: district || undefined,
        note: note || undefined,
        items,
        subtotal: Number(subtotal) || 0,
        shipping: Number(shipping) || 0,
        total: Number(total) || 0,
      });

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { status: orderStatus, isCustom: true },
      });

      return NextResponse.json(updated, { status: 201 });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "অর্ডার তৈরি ব্যর্থ";
      return jsonError(message);
    }
  });
}
