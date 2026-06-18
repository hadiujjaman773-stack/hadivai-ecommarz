import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  normalizeOrderStatus,
  type OrderStatus,
} from "@/lib/order-status";

const legacyLabels: Record<string, string> = {
  confirmed: "নিশ্চিত",
  processing: "প্রক্রিয়াধীন",
  shipped: "পাঠানো",
  delivered: "ডেলিভার্ড",
  cancelled: "বাতিল",
};

const legacyColors: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: string }) {
  const normalized = normalizeOrderStatus(status);
  const label =
    ORDER_STATUS_LABELS[normalized as OrderStatus] ||
    legacyLabels[status] ||
    legacyLabels[normalized] ||
    status;

  const colorClass =
    ORDER_STATUS_COLORS[normalized as OrderStatus] ||
    legacyColors[status] ||
    legacyColors[normalized] ||
    "bg-gray-100 text-gray-800";

  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
    >
      {label}
    </span>
  );
}
