"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ShieldAlert, X } from "lucide-react";
import {
  FRAUD_ASSESSMENT_LABELS_BN,
  formatCustomerRating,
  fraudRiskStyles,
  type FraudCheckResult,
} from "@/lib/fraud-check";

interface OrderFraudPanelProps {
  orderId: string;
  phone?: string | null;
  active: boolean;
  onClose: () => void;
}

export function OrderFraudPanel({
  orderId,
  phone,
  active,
  onClose,
}: OrderFraudPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FraudCheckResult | null>(null);

  const runCheck = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/fraudbd/order/${orderId}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Fraud BD চেক ব্যর্থ");
        setData(null);
        return;
      }
      setData(json as FraudCheckResult);
    } catch {
      setError("নেটওয়ার্ক ত্রুটি");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!active || !phone?.trim()) return;
    void runCheck();
  }, [active, phone, runCheck]);

  if (!active) return null;

  const styles = data ? fraudRiskStyles(data.assessment.level) : null;
  const courierEntries = data ? Object.entries(data.Summaries) : [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[95] p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[var(--brand-green)]" />
            <h2 className="text-lg font-semibold">Fraud BD — কুরিয়ার চেক</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100"
            aria-label="বন্ধ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          <p className="text-sm text-gray-600">
            ফোন: <span className="font-mono font-medium">{phone || "—"}</span>
          </p>

          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-gray-500">
              <RefreshCw className="w-5 h-5 animate-spin" />
              চেক করা হচ্ছে...
            </div>
          )}

          {error && !loading && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {error}
              <button
                type="button"
                onClick={() => void runCheck()}
                className="block mt-2 text-red-700 underline"
              >
                আবার চেষ্টা করুন
              </button>
            </div>
          )}

          {data && styles && !loading && (
            <>
              <div
                className={`rounded-xl border p-4 ${styles.panel}`}
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${styles.badge}`}
                  >
                    {FRAUD_ASSESSMENT_LABELS_BN[data.assessment.level]}
                  </span>
                  <span className={`text-sm font-medium ${styles.title}`}>
                    {data.assessment.label}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{data.assessment.reason}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs">মোট</p>
                  <p className="text-lg font-bold">{data.totalSummary.total}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-green-700 text-xs">সফল</p>
                  <p className="text-lg font-bold text-green-800">
                    {data.totalSummary.success}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-red-700 text-xs">বাতিল</p>
                  <p className="text-lg font-bold text-red-800">
                    {data.totalSummary.cancel}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-blue-700 text-xs">সাফল্য</p>
                  <p className="text-lg font-bold text-blue-800">
                    {data.totalSummary.successRate.toFixed(0)}%
                  </p>
                </div>
              </div>

              {courierEntries.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-800">
                    কুরিয়ার অনুযায়ী
                  </h3>
                  {courierEntries.map(([name, summary]) => (
                    <div
                      key={name}
                      className="border border-gray-200 rounded-lg p-3 text-sm"
                    >
                      <p className="font-medium text-gray-900">{name}</p>
                      {summary.data_type === "rating" ? (
                        <dl className="mt-1 space-y-0.5 text-gray-600">
                          <div className="flex justify-between gap-2">
                            <dt>রেটিং</dt>
                            <dd>
                              {formatCustomerRating(summary.customer_rating)}
                            </dd>
                          </div>
                          {summary.risk_level && (
                            <div className="flex justify-between gap-2">
                              <dt>ঝুঁকি</dt>
                              <dd className="capitalize">
                                {summary.risk_level.replace(/_/g, " ")}
                              </dd>
                            </div>
                          )}
                          {summary.message && (
                            <p className="text-xs text-gray-500 mt-1">
                              {summary.message}
                            </p>
                          )}
                        </dl>
                      ) : (
                        <dl className="mt-1 grid grid-cols-3 gap-2 text-xs text-gray-600">
                          <div>
                            <dt>মোট</dt>
                            <dd className="font-semibold text-gray-900">
                              {summary.total ?? 0}
                            </dd>
                          </div>
                          <div>
                            <dt>সফল</dt>
                            <dd className="font-semibold text-green-700">
                              {summary.success ?? 0}
                            </dd>
                          </div>
                          <div>
                            <dt>বাতিল</dt>
                            <dd className="font-semibold text-red-700">
                              {summary.cancel ?? 0}
                            </dd>
                          </div>
                        </dl>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-200 flex gap-2">
          <button
            type="button"
            onClick={() => void runCheck()}
            disabled={loading}
            className="btn-outline flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            রিফ্রেশ
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
          >
            বন্ধ
          </button>
        </div>
      </div>
    </div>
  );
}
