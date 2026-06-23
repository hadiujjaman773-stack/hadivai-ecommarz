import { NextResponse } from "next/server";
import { withAuth, jsonError } from "@/lib/admin-api";
import { checkOrderFraud, isFraudBdConfigured } from "@/lib/fraudbd";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  return withAuth(async () => {
    if (!isFraudBdConfigured()) {
      return jsonError("Fraud BD API কনফিগার করা নেই", 503);
    }

    const { id } = await params;

    try {
      const result = await checkOrderFraud(id);
      return NextResponse.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Fraud BD ত্রুটি";
      const status = message.includes("পাওয়া যায়নি")
        ? 404
        : message.includes("ফোন") || message.includes("মোবাইল")
          ? 400
          : 502;
      return jsonError(message, status);
    }
  });
}
