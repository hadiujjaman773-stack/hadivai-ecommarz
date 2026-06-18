"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useNotification } from "./NotificationProvider";
import { formatPrice } from "@/lib/format";

interface OrderRow {
  id: string;
  orderNumber: string;
  fullName: string;
  total: number;
  status: string;
  isCustom: boolean;
  createdAt: string;
}

export function DashboardRecentOrders({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const { success, error } = useNotification();

  const handleDelete = async (order: OrderRow) => {
    if (!confirm(`অর্ডার ${order.orderNumber} মুছে ফেলবেন?`)) return;

    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      error("মুছা ব্যর্থ", data.error);
      return;
    }
    success("অর্ডার মুছে ফেলা হয়েছে");
    router.refresh();
  };

  if (orders.length === 0) {
    return (
      <tr>
        <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
          কোনো অর্ডার নেই
        </td>
      </tr>
    );
  }

  return (
    <>
      {orders.map((order) => (
        <tr key={order.id} className="hover:bg-gray-50">
          <td className="px-5 py-3">
            <Link
              href={`/admin/orders/${order.id}`}
              className="text-[var(--accent-color)] hover:underline font-medium"
            >
              {order.orderNumber}
            </Link>
          </td>
          <td className="px-5 py-3">{order.fullName}</td>
          <td className="px-5 py-3 font-medium">{formatPrice(order.total)}</td>
          <td className="px-5 py-3">
            <StatusBadge status={order.status} />
          </td>
          <td className="px-5 py-3 text-gray-500">
            {new Date(order.createdAt).toLocaleDateString("bn-BD")}
          </td>
          <td className="px-5 py-3 text-right">
            <Link
              href={`/admin/orders/${order.id}`}
              className="p-1.5 text-gray-500 hover:text-[var(--accent-color)] inline-flex"
              title="সম্পাদনা"
            >
              <Pencil className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => handleDelete(order)}
              className="p-1.5 text-gray-500 hover:text-red-500 inline-flex ml-1"
              title="মুছুন"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}
