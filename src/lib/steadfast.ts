interface SteadfastOrderInput {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  note?: string;
  item_description?: string;
}

interface SteadfastOrderResponse {
  consignment_id?: number;
  tracking_code?: string;
  status?: string;
  message?: string;
}

export async function createSteadfastOrder(
  order: SteadfastOrderInput
): Promise<SteadfastOrderResponse> {
  const apiKey = process.env.STEADFAST_API_KEY;
  const secretKey = process.env.STEADFAST_SECRET_KEY;
  const baseUrl =
    process.env.STEADFAST_BASE_URL ||
    "https://portal.steadfast.com.bd/api/v1";

  if (!apiKey || !secretKey) {
    throw new Error(
      "Steadfast API সেটআপ নেই। .env-এ STEADFAST_API_KEY ও STEADFAST_SECRET_KEY যোগ করুন"
    );
  }

  const phone = order.recipient_phone.replace(/\D/g, "").slice(-11);
  if (phone.length !== 11) {
    throw new Error("ফোন নম্বর ১১ ডিজিট হতে হবে");
  }

  const res = await fetch(`${baseUrl}/create_order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": apiKey,
      "Secret-Key": secretKey,
    },
    body: JSON.stringify({
      invoice: order.invoice,
      recipient_name: order.recipient_name.slice(0, 100),
      recipient_phone: phone,
      recipient_address: order.recipient_address.slice(0, 250),
      cod_amount: order.cod_amount,
      note: order.note || "",
      item_description: order.item_description || "",
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data?.message || data?.errors?.[0] || "Steadfast অর্ডার তৈরি ব্যর্থ"
    );
  }

  const consignment = data.consignment || data.data?.consignment || data;
  return {
    consignment_id: consignment.consignment_id,
    tracking_code: consignment.tracking_code,
    status: consignment.status,
    message: data.message,
  };
}

export function buildSteadfastPayload(order: {
  orderNumber: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  note?: string | null;
  total: number;
  items: unknown;
}) {
  const items = order.items as Array<{ titleBn?: string; quantity?: number }>;
  const itemDescription = items
    .map((i) => `${i.titleBn || "পণ্য"} x${i.quantity || 1}`)
    .join(", ");

  return {
    invoice: order.orderNumber,
    recipient_name: order.fullName,
    recipient_phone: order.phone,
    recipient_address: `${order.address}, ${order.city}`,
    cod_amount: order.total,
    note: order.note || undefined,
    item_description: itemDescription,
  };
}
