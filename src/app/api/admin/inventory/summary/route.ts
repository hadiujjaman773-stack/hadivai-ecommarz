import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withInventoryAuth } from "@/lib/admin-api";
import {
  LOW_STOCK_THRESHOLD,
  getTotalStock,
} from "@/lib/inventory";
import { parseVariants } from "@/lib/product-variants";

export async function GET() {
  return withInventoryAuth(async () => {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        titleBn: true,
        stock: true,
        price: true,
        unit: true,
        variants: true,
        inStock: true,
      },
    });

    let lowStock = 0;
    let outOfStock = 0;
    let totalUnits = 0;
    let stockValue = 0;

    for (const p of products) {
      const variants = parseVariants(p.variants);
      const total = getTotalStock(p.stock, variants);
      totalUnits += total;
      stockValue += total * p.price;
      if (total === 0) outOfStock++;
      else if (total <= LOW_STOCK_THRESHOLD) lowStock++;
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      pendingReturns,
      monthExpenses,
      recentMovements,
      recentReturns,
      recentExpenses,
    ] = await Promise.all([
      prisma.productReturn.count({ where: { status: "pending" } }),
      prisma.expense.aggregate({
        _sum: { amount: true },
        where: { date: { gte: monthStart } },
      }),
      prisma.stockMovement.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
      prisma.productReturn.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.expense.findMany({
        take: 5,
        orderBy: { date: "desc" },
      }),
    ]);

    const lowStockProducts = products
      .map((p) => {
        const variants = parseVariants(p.variants);
        const total = getTotalStock(p.stock, variants);
        return { ...p, totalStock: total, variants };
      })
      .filter((p) => p.totalStock > 0 && p.totalStock <= LOW_STOCK_THRESHOLD)
      .sort((a, b) => a.totalStock - b.totalStock)
      .slice(0, 10);

    return NextResponse.json({
      totalProducts: products.length,
      totalUnits,
      stockValue,
      lowStock,
      outOfStock,
      pendingReturns,
      monthExpenses: monthExpenses._sum.amount ?? 0,
      lowStockProducts,
      recentMovements,
      recentReturns,
      recentExpenses,
    });
  });
}
