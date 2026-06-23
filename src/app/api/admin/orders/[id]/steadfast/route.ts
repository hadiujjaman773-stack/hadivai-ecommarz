import { NextResponse } from "next/server";
import { withAuth, jsonError } from "@/lib/admin-api";
import {
  SteadfastServices,
  createParcelForOrder,
} from "@/lib/steadfast.service";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  return withAuth(async () => {
    if (!SteadfastServices.isConfigured()) {
      return jsonError("Steadfast API কনফিগার করা নেই", 503);
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const note = typeof body.note === "string" ? body.note : undefined;

    try {
      const order = await createParcelForOrder(id, note);
      return NextResponse.json(order);
    } catch (err) {
      return jsonError(
        err instanceof Error ? err.message : "Steadfast ত্রুটি",
        500
      );
    }
  });
}
