import { NextResponse } from "next/server";
import { withAuth, jsonError } from "@/lib/admin-api";
import {
  SteadfastServices,
  syncDeliveryStatusForOrder,
} from "@/lib/steadfast.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  return withAuth(async () => {
    if (!SteadfastServices.isConfigured()) {
      return jsonError("Steadfast API কনফিগার করা নেই", 503);
    }

    const { id } = await params;

    try {
      const order = await syncDeliveryStatusForOrder(id);
      return NextResponse.json(order);
    } catch (err) {
      return jsonError(
        err instanceof Error ? err.message : "স্ট্যাটাস সিঙ্ক ব্যর্থ",
        500
      );
    }
  });
}
