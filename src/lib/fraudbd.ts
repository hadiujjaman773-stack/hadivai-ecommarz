import { isValidBdMobile, normalizeBdPhone } from "@/lib/bd-phone";
import type { FraudCheckResult } from "@/lib/fraud-check";
import { prisma } from "@/lib/prisma";

type CourierSummary = {
  logo?: string;
  data_type?: "rating" | "delivery";
  customer_rating?: string;
  risk_level?: string;
  message?: string;
  success_rate?: number;
  total?: number;
  success?: number;
  cancel?: number;
};

type FraudBdCheckData = {
  Summaries?: Record<string, CourierSummary>;
  totalSummary?: {
    total?: number;
    success?: number;
    cancel?: number;
    successRate?: number;
    cancelRate?: number;
  };
};

type FraudAssessment = FraudCheckResult["assessment"];

type FraudBdApiResponse = {
  status?: boolean;
  message?: string;
  data?: FraudBdCheckData | null;
};

function getConfig() {
  return {
    apiKey: process.env.FRAUDBD_API_KEY?.trim() || "",
    baseUrl: (process.env.FRAUDBD_BASE_URL || "https://fraudbd.com").replace(
      /\/$/,
      ""
    ),
    sandbox: process.env.FRAUDBD_SANDBOX === "true",
  };
}

function apiPath(sandbox: boolean) {
  return sandbox
    ? "/api/sandbox/check-courier-info"
    : "/api/check-courier-info";
}

function parseResponse(text: string, status: number): FraudBdApiResponse {
  try {
    return JSON.parse(text) as FraudBdApiResponse;
  } catch {
    throw new Error(
      status >= 500
        ? "Fraud BD সেবা অনুপলব্ধ"
        : "Fraud BD থেকে সঠিক রেসপন্স পাওয়া যায়নি"
    );
  }
}

export function isFraudBdConfigured(): boolean {
  return Boolean(process.env.FRAUDBD_API_KEY?.trim());
}

export function assessFraudRisk(data: FraudBdCheckData): FraudAssessment {
  const summaries = data.Summaries ?? {};
  const pathao = summaries.Pathao;

  if (pathao?.data_type === "rating") {
    const rating = pathao.customer_rating;
    const risk = pathao.risk_level?.toLowerCase();

    if (
      risk === "very_high" ||
      risk === "high" ||
      rating === "risky_customer"
    ) {
      return {
        level: "high",
        label: "High Risk",
        reason: pathao.message || "Pathao flagged this customer as risky",
      };
    }
    if (risk === "medium" || rating === "moderate_customer") {
      return {
        level: "medium",
        label: "Medium Risk",
        reason: pathao.message || "Pathao shows moderate delivery risk",
      };
    }
    if (rating === "new_customer" || risk === "unknown") {
      return {
        level: "unknown",
        label: "New Customer",
        reason: pathao.message || "No Pathao delivery history yet",
      };
    }
  }

  const ts = data.totalSummary;
  const total = ts?.total ?? 0;

  if (total === 0) {
    return {
      level: "unknown",
      label: "No History",
      reason: "No courier delivery records found for this number",
    };
  }

  const cancelRate = ts?.cancelRate ?? 0;
  const successRate = ts?.successRate ?? 100;

  if (cancelRate >= 40 || successRate < 50) {
    return {
      level: "high",
      label: "High Risk",
      reason: `${successRate.toFixed(0)}% delivery success across couriers`,
    };
  }
  if (cancelRate >= 25 || successRate < 70) {
    return {
      level: "medium",
      label: "Medium Risk",
      reason: `${successRate.toFixed(0)}% delivery success across couriers`,
    };
  }

  return {
    level: "low",
    label: "Low Risk",
    reason: `${successRate.toFixed(0)}% delivery success across couriers`,
  };
}

async function checkCourierInfo(rawPhone: string): Promise<FraudBdCheckData> {
  const { apiKey, baseUrl, sandbox } = getConfig();
  if (!apiKey) {
    throw new Error("Fraud BD API key কনফিগার করা নেই");
  }

  const phone = normalizeBdPhone(rawPhone);
  if (!isValidBdMobile(phone)) {
    throw new Error("বাংলাদেশের সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)");
  }

  const response = await fetch(`${baseUrl}${apiPath(sandbox)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": apiKey,
    },
    body: JSON.stringify({ phone_number: phone }),
  });

  const text = await response.text();
  const json = parseResponse(text, response.status);

  if (!json.status) {
    const message = json.message || "Fraud BD check failed";
    if (response.status === 429) {
      throw new Error(`অনেক বেশি রিকোয়েস্ট: ${message}`);
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error(`API key সমস্যা: ${message}`);
    }
    throw new Error(message);
  }

  return json.data ?? {};
}

function normalizeCheckResult(
  phone: string,
  data: FraudBdCheckData
): FraudCheckResult {
  const ts = data.totalSummary ?? {};
  return {
    phone,
    Summaries: data.Summaries ?? {},
    totalSummary: {
      total: ts.total ?? 0,
      success: ts.success ?? 0,
      cancel: ts.cancel ?? 0,
      successRate: ts.successRate ?? 0,
      cancelRate: ts.cancelRate ?? 0,
    },
    assessment: assessFraudRisk(data),
  };
}

export async function checkPhoneFraud(
  rawPhone: string
): Promise<FraudCheckResult> {
  const data = await checkCourierInfo(rawPhone);
  return normalizeCheckResult(normalizeBdPhone(rawPhone), data);
}

export async function checkOrderFraud(orderId: string): Promise<FraudCheckResult> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new Error("অর্ডার পাওয়া যায়নি");
  }

  const phone = order.phone?.trim();
  if (!phone) {
    throw new Error("এই অর্ডারে ফোন নম্বর নেই");
  }

  const data = await checkCourierInfo(phone);
  return normalizeCheckResult(normalizeBdPhone(phone), data);
}
