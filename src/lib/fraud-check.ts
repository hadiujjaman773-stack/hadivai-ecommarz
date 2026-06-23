export type FraudAssessmentLevel = "low" | "medium" | "high" | "unknown";

export type CourierFraudSummary = {
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

export type FraudCheckResult = {
  phone: string;
  Summaries: Record<string, CourierFraudSummary>;
  totalSummary: {
    total: number;
    success: number;
    cancel: number;
    successRate: number;
    cancelRate: number;
  };
  assessment: {
    level: FraudAssessmentLevel;
    label: string;
    reason: string;
  };
};

export function fraudRiskStyles(level: FraudAssessmentLevel) {
  switch (level) {
    case "high":
      return {
        badge: "bg-red-100 text-red-800 border-red-200",
        panel: "border-red-200 bg-red-50/50",
        title: "text-red-800",
      };
    case "medium":
      return {
        badge: "bg-amber-100 text-amber-800 border-amber-200",
        panel: "border-amber-200 bg-amber-50/50",
        title: "text-amber-800",
      };
    case "low":
      return {
        badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
        panel: "border-emerald-200 bg-emerald-50/50",
        title: "text-emerald-800",
      };
    default:
      return {
        badge: "bg-slate-100 text-slate-700 border-slate-200",
        panel: "border-slate-200 bg-slate-50/50",
        title: "text-slate-700",
      };
  }
}

export function formatCustomerRating(rating?: string) {
  if (!rating) return "—";
  return rating.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export const FRAUD_ASSESSMENT_LABELS_BN: Record<FraudAssessmentLevel, string> =
  {
    high: "উচ্চ ঝুঁকি",
    medium: "মাঝারি ঝুঁকি",
    low: "কম ঝুঁকি",
    unknown: "অজানা / নতুন",
  };
