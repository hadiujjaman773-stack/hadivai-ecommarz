"use client";

import { useRef, useState } from "react";
import { PageHeader } from "./PageHeader";
import { useNotification } from "./NotificationProvider";
import { formatPrice } from "@/lib/format";
import { steadfastStatusLabelBn } from "@/lib/steadfast-status";
import { RefreshCw, Search, Send, Wallet } from "lucide-react";

export function SteadfastManager() {
  const { error, info } = useNotification();
  const fetchInFlight = useRef(false);

  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceLoaded, setBalanceLoaded] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [fraudLoading, setFraudLoading] = useState(false);
  const [fraudResult, setFraudResult] = useState<{
    totalParcels: number;
    totalDelivered: number;
    totalCancelled: number;
    fraudReports: unknown[];
  } | null>(null);

  const loadBalance = async (showToastOnError = false) => {
    if (fetchInFlight.current) return;
    fetchInFlight.current = true;
    setBalanceLoading(true);
    setBalanceError(null);

    try {
      const res = await fetch("/api/admin/steadfast/balance");
      const data = await res.json();
      if (!res.ok) {
        const message = data.error || "ব্যালেন্স লোড ব্যর্থ";
        setBalance(null);
        setBalanceError(message);
        if (showToastOnError) {
          error("ব্যালেন্স লোড ব্যর্থ", message);
        }
        return;
      }
      setBalance(data.balance);
      setBalanceLoaded(true);
    } catch {
      const message = "নেটওয়ার্ক ত্রুটি";
      setBalanceError(message);
      if (showToastOnError) {
        error("ব্যালেন্স লোড ব্যর্থ", message);
      }
    } finally {
      setBalanceLoading(false);
      fetchInFlight.current = false;
    }
  };

  const runFraudCheck = async () => {
    if (!phone.trim()) {
      error("ফোন নম্বর দিন");
      return;
    }
    setFraudLoading(true);
    setFraudResult(null);
    try {
      const res = await fetch(
        `/api/admin/steadfast/fraud-check?phone=${encodeURIComponent(phone.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        error("ফ্রড চেক ব্যর্থ", data.error);
        return;
      }
      setFraudResult(data);
      info("ফ্রড চেক সম্পন্ন");
    } catch {
      error("ফ্রড চেক ব্যর্থ", "নেটওয়ার্ক ত্রুটি");
    } finally {
      setFraudLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Steadfast কুরিয়ার"
        description="ব্যালেন্স দেখুন, গ্রাহক ফ্রড চেক করুন ও অর্ডার পেজ থেকে কুরিয়ারে পাঠান"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[var(--brand-green)]" />
              Steadfast ব্যালেন্স
            </h2>
            {balanceLoaded && (
              <button
                type="button"
                onClick={() => void loadBalance(true)}
                disabled={balanceLoading}
                className="btn-outline px-3 py-1.5 text-sm flex items-center gap-1.5"
              >
                <RefreshCw
                  className={`w-4 h-4 ${balanceLoading ? "animate-spin" : ""}`}
                />
                রিফ্রেশ
              </button>
            )}
          </div>

          {!balanceLoaded && !balanceLoading ? (
            <button
              type="button"
              onClick={() => void loadBalance(true)}
              className="btn-primary px-4 py-2 text-sm"
            >
              ব্যালেন্স দেখুন
            </button>
          ) : (
            <p className="text-3xl font-bold text-[var(--brand-green)]">
              {balanceLoading
                ? "..."
                : balance !== null
                  ? formatPrice(balance)
                  : "—"}
            </p>
          )}

          {balanceError && !balanceLoading && (
            <p className="text-sm text-red-600 mt-2">{balanceError}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            অর্ডার Steadfast-এ পাঠাতে অর্ডার বিস্তারিত পেজে যান অথবা অর্ডার
            তালিকা থেকে একাধিক নির্বাচন করুন।
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-[var(--brand-green)]" />
            ফ্রড চেক (ফোন) — Steadfast
          </h2>
          <div className="flex gap-2">
            <input
              type="tel"
              className="input-field flex-1"
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void runFraudCheck()}
            />
            <button
              type="button"
              onClick={() => void runFraudCheck()}
              disabled={fraudLoading}
              className="btn-primary px-4 py-2 text-sm whitespace-nowrap"
            >
              {fraudLoading ? "চেক..." : "চেক করুন"}
            </button>
          </div>

          {fraudResult && (
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <dt className="text-gray-500">মোট পার্সেল</dt>
                <dd className="text-lg font-semibold">
                  {fraudResult.totalParcels}
                </dd>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <dt className="text-green-700">ডেলিভার</dt>
                <dd className="text-lg font-semibold text-green-800">
                  {fraudResult.totalDelivered}
                </dd>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <dt className="text-red-700">বাতিল</dt>
                <dd className="text-lg font-semibold text-red-800">
                  {fraudResult.totalCancelled}
                </dd>
              </div>
              <div className="bg-amber-50 rounded-lg p-3">
                <dt className="text-amber-700">ফ্রড রিপোর্ট</dt>
                <dd className="text-lg font-semibold text-amber-800">
                  {Array.isArray(fraudResult.fraudReports)
                    ? fraudResult.fraudReports.length
                    : 0}
                </dd>
              </div>
            </dl>
          )}
        </div>
      </div>

      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-xl p-5 text-sm text-purple-900">
        <h3 className="font-semibold flex items-center gap-2 mb-2">
          <Send className="w-4 h-4" />
          কুরিয়ারে পাঠানোর নিয়ম
        </h3>
        <ul className="list-disc list-inside space-y-1 text-purple-800">
          <li>অর্ডার স্ট্যাটাস &quot;কুরিয়ার&quot; করলে Steadfast-এ পাঠানোর অপশন আসবে</li>
          <li>অর্ডার বিস্তারিত থেকে সরাসরি Steadfast-এ পাঠানো যাবে</li>
          <li>
            ডেলিভারি স্ট্যাটাস:             {steadfastStatusLabelBn("in_review")},{" "}
            {steadfastStatusLabelBn("pending")},{" "}
            {steadfastStatusLabelBn("delivered")} ইত্যাদি
          </li>
        </ul>
      </div>
    </div>
  );
}
