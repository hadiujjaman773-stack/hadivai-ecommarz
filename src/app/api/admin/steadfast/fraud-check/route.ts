import { NextResponse } from "next/server";
import { withAuth, jsonError } from "@/lib/admin-api";
import { checkSteadfastFraud, isSteadfastConfigured } from "@/lib/steadfast";

export async function GET(request: Request) {
  return withAuth(async () => {
    if (!isSteadfastConfigured()) {
      return jsonError("Steadfast API কনফিগার করা নেই", 503);
    }

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    if (!phone?.trim()) {
      return jsonError("ফোন নম্বর প্রয়োজন");
    }

    try {
      const result = await checkSteadfastFraud(phone.trim());
      return NextResponse.json(result);
    } catch (err) {
      return jsonError(
        err instanceof Error ? err.message : "ফ্রড চেক ব্যর্থ",
        500
      );
    }
  });
}
