"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "./PageHeader";
import { StatusBadge } from "./StatusBadge";
import { ConfirmModal } from "./ConfirmModal";
import { useNotification } from "./NotificationProvider";
import { formatPrice } from "@/lib/format";
import { steadfastStatusLabelBn } from "@/lib/steadfast-status";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  normalizeOrderStatus,
} from "@/lib/order-status";
import { ArrowLeft, Ban, ShieldCheck, Pencil, Send, RefreshCw } from "lucide-react";
import { CustomOrderForm } from "./CustomOrderForm";
import { OrderFraudPanel } from "./OrderFraudPanel";
import { OrderFraudButton } from "./OrderFraudButton";

interface OrderItem {
  titleBn: string;
  price: number;
  quantity: number;
  size?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  fullName: string;
  email?: string | null;
  phone: string;
  address: string;
  city: string;
  district: string | null;
  note: string | null;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  isCustom: boolean;
  clientIp?: string | null;
  steadfastConsignmentId: string | null;
  steadfastTrackingCode: string | null;
  steadfastDeliveryStatus: string | null;
  steadfastLastError: string | null;
  steadfastCreatedAt: string | Date | null;
  steadfastSyncedAt: string | Date | null;
  createdAt: string | Date;
}

export function OrderDetail({
  order: initial,
  ipBlocked: initialIpBlocked,
}: {
  order: Order;
  ipBlocked: boolean;
}) {
  const [order, setOrder] = useState(initial);
  const [ipBlocked, setIpBlocked] = useState(initialIpBlocked);
  const [showEdit, setShowEdit] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [ipLoading, setIpLoading] = useState(false);
  const [showSteadfastModal, setShowSteadfastModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [steadfastLoading, setSteadfastLoading] = useState(false);
  const [showFraudPanel, setShowFraudPanel] = useState(false);
  const { success, error, info } = useNotification();

  const applyStatus = async (status: string, sendToSteadfast = false) => {
    if (updating) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, sendToSteadfast }),
      });

      let data: { error?: string } & Partial<Order> = {};
      try {
        data = await res.json();
      } catch {
        throw new Error("সার্ভার থেকে সঠিক রেসপন্স পাওয়া যায়নি");
      }

      if (!res.ok) {
        error("স্ট্যাটাস আপডেট ব্যর্থ", data.error);
        return;
      }

      setOrder((prev) => ({ ...prev, ...data }));
      setShowSteadfastModal(false);
      setPendingStatus(null);

      const normalized = normalizeOrderStatus(status);
      if (normalized === "courier" && sendToSteadfast) {
        success(
          "Steadfast-এ অর্ডার পাঠানো হয়েছে",
          data.steadfastTrackingCode
            ? `ট্র্যাকিং: ${data.steadfastTrackingCode}`
            : undefined
        );
      } else {
        info(
          "স্ট্যাটাস আপডেট হয়েছে",
          ORDER_STATUS_LABELS[normalized as keyof typeof ORDER_STATUS_LABELS] ||
            normalized
        );
      }
    } catch (err) {
      error(
        "স্ট্যাটাস আপডেট ব্যর্থ",
        err instanceof Error ? err.message : "নেটওয়ার্ক ত্রুটি"
      );
      setShowSteadfastModal(false);
      setPendingStatus(null);
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === normalizeOrderStatus(order.status)) return;

    if (newStatus === "courier" && !order.steadfastConsignmentId) {
      setPendingStatus(newStatus);
      setShowSteadfastModal(true);
      return;
    }

    void applyStatus(newStatus, false);
  };

  const handleSteadfastConfirm = () => {
    if (pendingStatus) void applyStatus(pendingStatus, true);
  };

  const handleSteadfastSkip = () => {
    if (pendingStatus) void applyStatus(pendingStatus, false);
  };

  const sendToSteadfast = async () => {
    if (steadfastLoading || order.steadfastConsignmentId) return;
    setSteadfastLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/steadfast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        error("Steadfast ব্যর্থ", data.error);
        return;
      }
      setOrder((prev) => ({ ...prev, ...data }));
      success(
        "Steadfast-এ পাঠানো হয়েছে",
        data.steadfastTrackingCode
          ? `ট্র্যাকিং: ${data.steadfastTrackingCode}`
          : undefined
      );
    } catch {
      error("Steadfast ব্যর্থ", "নেটওয়ার্ক ত্রুটি");
    } finally {
      setSteadfastLoading(false);
    }
  };

  const syncSteadfastStatus = async () => {
    if (steadfastLoading || !order.steadfastConsignmentId) return;
    setSteadfastLoading(true);
    try {
      const res = await fetch(
        `/api/admin/orders/${order.id}/steadfast/status`
      );
      const data = await res.json();
      if (!res.ok) {
        error("স্ট্যাটাস সিঙ্ক ব্যর্থ", data.error);
        return;
      }
      setOrder((prev) => ({ ...prev, ...data }));
      success(
        "ডেলিভারি স্ট্যাটাস আপডেট",
        steadfastStatusLabelBn(data.steadfastDeliveryStatus)
      );
    } catch {
      error("স্ট্যাটাস সিঙ্ক ব্যর্থ", "নেটওয়ার্ক ত্রুটি");
    } finally {
      setSteadfastLoading(false);
    }
  };

  const toggleIpBlock = async () => {
    if (!order.clientIp) {
      error("IP নেই", "এই অর্ডারে IP সংরক্ষিত নেই");
      return;
    }

    setIpLoading(true);
    try {
      if (ipBlocked) {
        const res = await fetch(
          `/api/admin/blocked-ips?ip=${encodeURIComponent(order.clientIp)}`,
          { method: "DELETE" }
        );
        const data = await res.json();
        if (!res.ok) {
          error("আনব্লক ব্যর্থ", data.error);
          return;
        }
        setIpBlocked(false);
        success("IP আনব্লক করা হয়েছে");
      } else {
        const res = await fetch("/api/admin/blocked-ips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ip: order.clientIp,
            orderId: order.id,
            reason: `অর্ডার ${order.orderNumber}`,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          error("ব্লক ব্যর্থ", data.error);
          return;
        }
        setIpBlocked(true);
        success("IP ব্লক করা হয়েছে");
      }
    } catch {
      error("ত্রুটি", "নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setIpLoading(false);
    }
  };

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        অর্ডার তালিকায় ফিরুন
      </Link>

      <PageHeader
        title={`অর্ডার ${order.orderNumber}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {order.isCustom && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                কাস্টম
              </span>
            )}
            <StatusBadge status={order.status} />
            <button
              type="button"
              onClick={() => setShowEdit(true)}
              className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-sm"
            >
              <Pencil className="w-4 h-4" />
              সম্পাদনা
            </button>
          </div>
        }
      />

      {showEdit && (
        <CustomOrderForm
          initial={{
            id: order.id,
            fullName: order.fullName,
            email: order.email,
            phone: order.phone,
            address: order.address,
            city: order.city,
            district: order.district,
            note: order.note,
            items: order.items.map((item) => ({
              titleBn: item.titleBn,
              price: item.price,
              quantity: item.quantity,
            })),
            subtotal: order.subtotal,
            shipping: order.shipping,
            total: order.total,
            status: order.status,
            clientIp: order.clientIp,
          }}
          ipBlocked={ipBlocked}
          onIpBlockedChange={setIpBlocked}
          onSuccess={(updated) => {
            if (updated) {
              setOrder((prev) => ({
                ...prev,
                fullName: String(updated.fullName ?? prev.fullName),
                email:
                  updated.email !== undefined
                    ? (updated.email as string | null)
                    : prev.email,
                phone: String(updated.phone ?? prev.phone),
                address: String(updated.address ?? prev.address),
                city: String(updated.city ?? prev.city),
                district:
                  updated.district !== undefined
                    ? (updated.district as string | null)
                    : prev.district,
                note:
                  updated.note !== undefined
                    ? (updated.note as string | null)
                    : prev.note,
                items: (updated.items as OrderItem[]) ?? prev.items,
                subtotal: Number(updated.subtotal ?? prev.subtotal),
                shipping: Number(updated.shipping ?? prev.shipping),
                total: Number(updated.total ?? prev.total),
                status: String(updated.status ?? prev.status),
              }));
            }
            setShowEdit(false);
          }}
          onCancel={() => setShowEdit(false)}
        />
      )}

      <ConfirmModal
        open={showSteadfastModal}
        title="Steadfast কুরিয়ার"
        message="আপনি Steadfast-এ অর্ডার কনফার্ম করতে চান? OK চাপলে অর্ডার ডেটা Steadfast কুরিয়ারে চলে যাবে।"
        confirmLabel="হ্যাঁ, Steadfast-এ পাঠান"
        cancelLabel="না, শুধু স্ট্যাটাস পরিবর্তন"
        loading={updating}
        onConfirm={handleSteadfastConfirm}
        onCancel={handleSteadfastSkip}
      />

      <OrderFraudPanel
        orderId={order.id}
        phone={order.phone}
        active={showFraudPanel}
        onClose={() => setShowFraudPanel(false)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold mb-4">পণ্য</h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.titleBn}</p>
                    {item.size && (
                      <p className="text-gray-500 text-xs">সাইজ: {item.size}</p>
                    )}
                    <p className="text-gray-500">× {item.quantity}</p>
                  </div>
                  <p className="font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">সাবটোটাল</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">শিপিং</span>
                <span>{formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-base">
                <span>মোট</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold mb-4">গ্রাহক তথ্য</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">নাম</dt>
                <dd className="font-medium">{order.fullName}</dd>
              </div>
              <div>
                <dt className="text-gray-500">ফোন</dt>
                <dd className="flex flex-wrap items-center gap-2">
                  <span>{order.phone}</span>
                  <OrderFraudButton onClick={() => setShowFraudPanel(true)} />
                </dd>
              </div>
              {order.email && (
                <div>
                  <dt className="text-gray-500">ইমেইল</dt>
                  <dd>{order.email}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">ঠিকানা</dt>
                <dd>{order.address}</dd>
              </div>
              <div>
                <dt className="text-gray-500">শহর</dt>
                <dd>{order.city}</dd>
              </div>
              {order.note && (
                <div>
                  <dt className="text-gray-500">নোট</dt>
                  <dd>{order.note}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">তারিখ</dt>
                <dd>{new Date(order.createdAt).toLocaleString("bn-BD")}</dd>
              </div>
              <div>
                <dt className="text-gray-500">IP ঠিকানা</dt>
                <dd className="font-mono text-xs">
                  {order.clientIp || "সংরক্ষিত নেই"}
                </dd>
                {order.clientIp && (
                  <div className="mt-2 flex items-center gap-2">
                    {ipBlocked ? (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                        ব্লক করা
                      </span>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        সক্রিয়
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={toggleIpBlock}
                      disabled={ipLoading}
                      className={`text-xs px-3 py-1.5 rounded-md border flex items-center gap-1 disabled:opacity-60 ${
                        ipBlocked
                          ? "border-green-300 text-green-700 hover:bg-green-50"
                          : "border-red-300 text-red-700 hover:bg-red-50"
                      }`}
                    >
                      {ipBlocked ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          আনব্লক
                        </>
                      ) : (
                        <>
                          <Ban className="w-3.5 h-3.5" />
                          ব্লক
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </dl>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="font-semibold text-purple-900">Steadfast কুরিয়ার</h2>
              {!order.steadfastConsignmentId ? (
                <button
                  type="button"
                  onClick={() => void sendToSteadfast()}
                  disabled={steadfastLoading}
                  className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  {steadfastLoading ? "পাঠানো..." : "পাঠান"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void syncSteadfastStatus()}
                  disabled={steadfastLoading}
                  className="btn-outline px-3 py-1.5 text-xs flex items-center gap-1"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${steadfastLoading ? "animate-spin" : ""}`}
                  />
                  স্ট্যাটাস সিঙ্ক
                </button>
              )}
            </div>
            {order.steadfastTrackingCode ? (
              <dl className="text-sm space-y-1">
                <div>
                  <dt className="text-purple-600">ট্র্যাকিং কোড</dt>
                  <dd className="font-mono font-bold">
                    {order.steadfastTrackingCode}
                  </dd>
                </div>
                {order.steadfastConsignmentId && (
                  <div>
                    <dt className="text-purple-600">Consignment ID</dt>
                    <dd>{order.steadfastConsignmentId}</dd>
                  </div>
                )}
                {order.steadfastDeliveryStatus && (
                  <div>
                    <dt className="text-purple-600">ডেলিভারি স্ট্যাটাস</dt>
                    <dd className="font-medium">
                      {steadfastStatusLabelBn(order.steadfastDeliveryStatus)}
                    </dd>
                  </div>
                )}
                {order.steadfastSyncedAt && (
                  <div>
                    <dt className="text-purple-600">সর্বশেষ সিঙ্ক</dt>
                    <dd className="text-xs">
                      {new Date(order.steadfastSyncedAt).toLocaleString("bn-BD")}
                    </dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-sm text-purple-800">
                এখনো Steadfast-এ পাঠানো হয়নি। উপরের বাটনে ক্লিক করুন।
              </p>
            )}
            {order.steadfastLastError && (
              <p className="text-xs text-red-600 mt-2">{order.steadfastLastError}</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold mb-4">স্ট্যাটাস আপডেট</h2>
            <select
              className="input-field"
              value={normalizeOrderStatus(order.status)}
              disabled={updating}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
