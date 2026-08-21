export const ORDER_STATUSES = [
  "pending",
  "order_confirm",
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
  order_confirm: "অর্ডার কনফার্ম",
  calling_stage: "কলিং স্টেজ",
  packaging: "প্যাকেজিং",
  courier: "কুরিয়ার",
  payment_done: "পেমেন্ট ডান",
  return: "রিটার্ন",
  cancel: "বাতিল",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  order_confirm: "bg-teal-100 text-teal-800",
  calling_stage: "bg-orange-100 text-orange-800",
  packaging: "bg-blue-100 text-blue-800",
  courier: "bg-purple-100 text-purple-800",
  payment_done: "bg-green-100 text-green-800",
  return: "bg-pink-100 text-pink-800",
  cancel: "bg-red-100 text-red-800",
};

export function normalizeOrderStatus(status: string): string {
  return status;
}

export function isValidOrderStatus(status: string): status is OrderStatus {
  return ORDER_STATUSES.includes(status as OrderStatus);
}

export function statusFilterValues(status: string): string[] {
  return [status];
}
