import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/admin-api";

export async function GET() {
  return withAuth(async () => {
    const [
      totalOrders,
      pendingOrders,
      totalProducts,
      totalCategories,
      revenueAgg,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "cancelled" } },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          fullName: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      totalProducts,
      totalCategories,
      totalRevenue: revenueAgg._sum.total ?? 0,
      recentOrders,
    });
  });
}
