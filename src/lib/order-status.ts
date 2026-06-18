export const ORDER_STATUSES = [
  "pending",
  "calling_stage",
  "packaging",
  "courier",
  "payment_done",
  "return",
  "cancel",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "অপেক্ষমাণ",
  calling_stage: "কলিং স্টেজ",
  packaging: "প্যাকেজিং",
  courier: "কুরিয়ার",
  payment_done: "পেমেন্ট ডান",
  return: "রিটার্ন",
  cancel: "বাতিল",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  calling_stage: "bg-orange-100 text-orange-800",
  packaging: "bg-blue-100 text-blue-800",
  courier: "bg-purple-100 text-purple-800",
  payment_done: "bg-green-100 text-green-800",
  return: "bg-pink-100 text-pink-800",
  cancel: "bg-red-100 text-red-800",
};

/** পুরনো ডাটাবেস রেকর্ডের জন্য */
export const LEGACY_ORDER_STATUS_ALIASES: Record<string, OrderStatus> = {
  order_confirm: "packaging",
};

export function normalizeOrderStatus(status: string): string {
  return LEGACY_ORDER_STATUS_ALIASES[status] ?? status;
}

export function isValidOrderStatus(status: string): status is OrderStatus {
  const normalized = normalizeOrderStatus(status);
  return ORDER_STATUSES.includes(normalized as OrderStatus);
}

export function statusFilterValues(status: string): string[] {
  const normalized = normalizeOrderStatus(status);
  if (normalized === "packaging") return ["packaging", "order_confirm"];
  return [normalized];
}
