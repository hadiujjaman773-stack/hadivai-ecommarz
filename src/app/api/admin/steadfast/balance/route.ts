import { NextResponse } from "next/server";
import { withAuth, jsonError } from "@/lib/admin-api";
import { getSteadfastBalance, isSteadfastConfigured } from "@/lib/steadfast";

export async function GET() {
  return withAuth(async () => {
    if (!isSteadfastConfigured()) {
      return jsonError("Steadfast API কনফিগার করা নেই", 503);
    }

    try {
      const balance = await getSteadfastBalance();
      return NextResponse.json({ balance });
    } catch (err) {
      return jsonError(
        err instanceof Error ? err.message : "ব্যালেন্স লোড ব্যর্থ",
        500
      );
    }
  });
}
