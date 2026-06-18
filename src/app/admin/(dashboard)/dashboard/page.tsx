import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { DashboardRecentOrders } from "@/components/admin/DashboardRecentOrders";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatPrice } from "@/lib/format";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  statusFilterValues,
} from "@/lib/order-status";
import Link from "next/link";
import { ShoppingCart, Package, DollarSign } from "lucide-react";

export const metadata = { title: "ড্যাশবোর্ড" };

async function getStats() {
  const statusCountPromises = ORDER_STATUSES.map(async (status) => ({
    status,
    count: await prisma.order.count({
      where: { status: { in: statusFilterValues(status) } },
    }),
  }));

  const [
    totalOrders,
    totalProducts,
    totalCategories,
    revenueAgg,
    recentOrders,
    statusCounts,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: "payment_done" },
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
        isCustom: true,
        createdAt: true,
      },
    }),
    Promise.all(statusCountPromises),
  ]);

  return {
    totalOrders,
    totalProducts,
    totalCategories,
    totalRevenue: revenueAgg._sum.total ?? 0,
    recentOrders,
    statusCounts,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    {
      label: "মোট অর্ডার",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "bg-blue-500",
      href: "/admin/orders",
    },
    {
      label: "মোট পণ্য",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-green-500",
      href: "/admin/products",
    },
    {
      label: "পেমেন্ট সম্পন্ন আয়",
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: "bg-[var(--accent-color)]",
      href: "/admin/orders?status=payment_done",
    },
  ];

  return (
    <div>
      <PageHeader
        title="ড্যাশবোর্ড"
        description="আপনার স্টোরের সারসংক্ষেপ"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 mb-8">
        <div className="p-5 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">স্ট্যাটাস অনুযায়ী অর্ডার</h2>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {stats.statusCounts.map(({ status, count }) => (
            <Link
              key={status}
              href={`/admin/orders?status=${status}`}
              className="rounded-lg border border-gray-100 p-3 hover:border-[var(--accent-color)]/40 hover:shadow-sm transition-all"
            >
              <StatusBadge status={status} />
              <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {ORDER_STATUS_LABELS[status]}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">সাম্প্রতিক অর্ডার</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-[var(--accent-color)] hover:underline"
          >
            সব দেখুন
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">অর্ডার #</th>
                <th className="text-left px-5 py-3 font-medium">গ্রাহক</th>
                <th className="text-left px-5 py-3 font-medium">মোট</th>
                <th className="text-left px-5 py-3 font-medium">স্ট্যাটাস</th>
                <th className="text-left px-5 py-3 font-medium">তারিখ</th>
                <th className="text-right px-5 py-3 font-medium">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <DashboardRecentOrders
                orders={stats.recentOrders.map((order) => ({
                  ...order,
                  createdAt: order.createdAt.toISOString(),
                }))}
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
