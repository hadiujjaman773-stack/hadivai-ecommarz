import { isValidBdMobile, normalizeBdPhone } from "@/lib/bd-phone";

export interface SteadfastOrderInput {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  delivery_type?: number;
  total_lot?: number;
  note?: string;
  item_description?: string;
  recipient_email?: string;
}

export interface SteadfastOrderResult {
  consignment_id?: number | string;
  tracking_code?: string;
  status?: string;
  message?: string;
}

export interface SteadfastBulkResultItem {
  invoice: string;
  status: string;
  consignment_id?: number | string | null;
  tracking_code?: string | null;
  recipient_name?: string;
  recipient_phone?: string;
  recipient_address?: string;
  cod_amount?: string | number;
  note?: string | null;
}

export interface SteadfastFraudCheck {
  total_parcels?: number;
  Total_parcels?: number;
  total_delivered?: number;
  total_cancelled?: number;
  total_fraud_reports?: unknown[];
}

function getBaseUrl() {
  return (
    process.env.STEADFAST_API_URL ||
    process.env.STEADFAST_BASE_URL ||
    "https://portal.packzy.com/api/v1"
  ).replace(/\/$/, "");
}

export function isSteadfastConfigured(): boolean {
  return Boolean(
    process.env.STEADFAST_API_KEY?.trim() &&
      process.env.STEADFAST_SECRET_KEY?.trim()
  );
}

function getCredentials() {
  const apiKey = process.env.STEADFAST_API_KEY?.trim();
  const secretKey = process.env.STEADFAST_SECRET_KEY?.trim();
  if (!apiKey || !secretKey) {
    throw new Error(
      "Steadfast API সেটআপ নেই। .env-এ STEADFAST_API_KEY ও STEADFAST_SECRET_KEY যোগ করুন"
    );
  }
  return { apiKey, secretKey };
}

function steadfastHeaders() {
  const { apiKey, secretKey } = getCredentials();
  return {
    "Content-Type": "application/json",
    "Api-Key": apiKey,
    "Secret-Key": secretKey,
  };
}

async function steadfastRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${getBaseUrl()}${path}`, {
      ...init,
      headers: {
        ...steadfastHeaders(),
        ...init?.headers,
      },
    });
  } catch {
    throw new Error(
      "Steadfast সার্ভারে সংযোগ ব্যর্থ — ইন্টারনেট বা STEADFAST_API_URL চেক করুন"
    );
  }

  let data: Record<string, unknown> = {};
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    throw new Error("Steadfast API থেকে সঠিক রেসপন্স পাওয়া যায়নি");
  }

  const status = data.status as number | undefined;
  if (!res.ok || (status !== undefined && status !== 200)) {
    const message =
      (data.message as string) ||
      (Array.isArray(data.errors) ? String(data.errors[0]) : null) ||
      "Steadfast API ত্রুটি";
    throw new Error(message);
  }

  return data as T;
}

function parseConsignmentResult(
  data: Record<string, unknown>
): SteadfastOrderResult {
  const consignment =
    (data.consignment as Record<string, unknown> | undefined) ||
    ((data.data as Record<string, unknown> | undefined)?.consignment as
      | Record<string, unknown>
      | undefined) ||
    data;

  return {
    consignment_id: consignment.consignment_id as number | string | undefined,
    tracking_code: consignment.tracking_code as string | undefined,
    status: consignment.status as string | undefined,
    message: data.message as string | undefined,
  };
}

export async function createSteadfastOrder(
  order: SteadfastOrderInput
): Promise<SteadfastOrderResult> {
  const phone = normalizeBdPhone(order.recipient_phone);
  if (!isValidBdMobile(phone)) {
    throw new Error("বাংলাদেশের সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)");
  }

  const data = await steadfastRequest<Record<string, unknown>>("/create_order", {
    method: "POST",
    body: JSON.stringify({
      invoice: order.invoice,
      recipient_name: order.recipient_name.slice(0, 100),
      recipient_phone: phone,
      recipient_address: order.recipient_address.slice(0, 250),
      cod_amount: Math.max(0, Math.round(order.cod_amount)),
      delivery_type: order.delivery_type ?? 0,
      total_lot: order.total_lot ?? 1,
      note: (order.note || "").slice(0, 250),
      item_description: (order.item_description || "").slice(0, 250),
      ...(order.recipient_email
        ? { recipient_email: order.recipient_email.slice(0, 100) }
        : {}),
    }),
  });

  return parseConsignmentResult(data);
}

export async function bulkCreateSteadfastOrders(
  orders: SteadfastOrderInput[]
): Promise<SteadfastBulkResultItem[]> {
  if (orders.length === 0) {
    throw new Error("অন্তত একটি অর্ডার প্রয়োজন");
  }
  if (orders.length > 500) {
    throw new Error("একবারে সর্বোচ্চ ৫০০টি অর্ডার পাঠানো যাবে");
  }

  const payload = orders.map((order) => ({
    invoice: order.invoice,
    recipient_name: order.recipient_name.slice(0, 100),
    recipient_phone: normalizeBdPhone(order.recipient_phone),
    recipient_address: order.recipient_address.slice(0, 250),
    cod_amount: Math.max(0, Math.round(order.cod_amount)),
    delivery_type: order.delivery_type ?? 0,
    note: order.note || "",
  }));

  const data = await steadfastRequest<{ data?: SteadfastBulkResultItem[] }>(
    "/create_order/bulk-order",
    {
      method: "POST",
      body: JSON.stringify({ data: JSON.stringify(payload) }),
    }
  );

  return data.data ?? [];
}

export async function getSteadfastStatusByConsignmentId(id: string) {
  const data = await steadfastRequest<{ delivery_status: string }>(
    `/status_by_cid/${encodeURIComponent(id)}`
  );
  return data.delivery_status;
}

export async function getSteadfastStatusByInvoice(invoice: string) {
  const data = await steadfastRequest<{ delivery_status: string }>(
    `/status_by_invoice/${encodeURIComponent(invoice)}`
  );
  return data.delivery_status;
}

export async function getSteadfastStatusByTrackingCode(trackingCode: string) {
  const data = await steadfastRequest<{ delivery_status: string }>(
    `/status_by_trackingcode/${encodeURIComponent(trackingCode)}`
  );
  return data.delivery_status;
}

export async function getSteadfastBalance() {
  const data = await steadfastRequest<{ current_balance: number }>(
    "/get_balance"
  );
  return data.current_balance;
}

export async function checkSteadfastFraud(phone: string) {
  const normalized = normalizeBdPhone(phone);
  if (!isValidBdMobile(normalized)) {
    throw new Error("বাংলাদেশের সঠিক মোবাইল নম্বর দিন");
  }
  const data = await steadfastRequest<SteadfastFraudCheck>(
    `/fraud_check/${normalized}`
  );
  return {
    totalParcels: data.Total_parcels ?? data.total_parcels ?? 0,
    totalDelivered: data.total_delivered ?? 0,
    totalCancelled: data.total_cancelled ?? 0,
    fraudReports: data.total_fraud_reports ?? [],
  };
}

export function buildSteadfastPayload(order: {
  orderNumber: string;
  fullName: string;
  phone: string;
  email?: string | null;
  address: string;
  city: string;
  district?: string | null;
  note?: string | null;
  total: number;
  items: unknown;
  extraNote?: string | null;
}): SteadfastOrderInput {
  const items = order.items as Array<{ titleBn?: string; quantity?: number }>;
  const totalLot = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const itemDescription = items
    .map((i) => `${i.titleBn || "পণ্য"} x${i.quantity || 1}`)
    .join(", ")
    .slice(0, 250);

  const addressParts = [order.address, order.city, order.district].filter(
    Boolean
  );
  const combinedNote = [order.note, order.extraNote].filter(Boolean).join(" | ");

  return {
    invoice: order.orderNumber,
    recipient_name: order.fullName,
    recipient_phone: order.phone,
    recipient_address: addressParts.join(", "),
    cod_amount: Math.max(0, Math.round(order.total)),
    delivery_type: 0,
    total_lot: totalLot || 1,
    note: combinedNote || undefined,
    item_description: itemDescription,
    recipient_email: order.email?.trim() || undefined,
  };
}

export { steadfastStatusLabelBn, getSteadfastDeliveryLabel } from "@/lib/steadfast-status";
