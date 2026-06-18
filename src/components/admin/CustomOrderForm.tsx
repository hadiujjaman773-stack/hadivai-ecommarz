"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Ban, ShieldCheck } from "lucide-react";
import { AdminModal } from "./AdminModal";
import { useNotification } from "./NotificationProvider";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  normalizeOrderStatus,
} from "@/lib/order-status";

interface OrderItem {
  titleBn: string;
  price: number;
  quantity: number;
}

interface CustomOrderFormProps {
  initial?: {
    id: string;
    fullName: string;
    email?: string | null;
    phone: string;
    address: string;
    city: string;
    district?: string | null;
    note?: string | null;
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    total: number;
    status: string;
    clientIp?: string | null;
  };
  ipBlocked?: boolean;
  onIpBlockedChange?: (blocked: boolean) => void;
  onSuccess: (order?: Record<string, unknown>) => void;
  onCancel: () => void;
}

const emptyItem = { titleBn: "", price: 0, quantity: 1 };

export function CustomOrderForm({
  initial,
  ipBlocked: initialIpBlocked = false,
  onIpBlockedChange,
  onSuccess,
  onCancel,
}: CustomOrderFormProps) {
  const { success, error } = useNotification();
  const [saving, setSaving] = useState(false);
  const [ipBlocked, setIpBlocked] = useState(initialIpBlocked);
  const [ipLoading, setIpLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: initial?.fullName || "",
    email: initial?.email || "",
    phone: initial?.phone || "",
    address: initial?.address || "",
    city: initial?.city || "",
    district: initial?.district || "",
    note: initial?.note || "",
    shipping: initial?.shipping ?? 0,
    status: initial?.status ? normalizeOrderStatus(initial.status) : "pending",
  });
  const [items, setItems] = useState<OrderItem[]>(
    initial?.items?.length ? initial.items : [{ ...emptyItem }]
  );

  useEffect(() => {
    setIpBlocked(initialIpBlocked);
  }, [initialIpBlocked]);

  const subtotal = items.reduce(
    (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1),
    0
  );
  const total = subtotal + (Number(form.shipping) || 0);

  const updateItem = (index: number, field: keyof OrderItem, value: string) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: field === "titleBn" ? value : Number(value) || 0,
            }
          : item
      )
    );
  };

  const toggleIpBlock = async () => {
    if (!initial?.clientIp) {
      error("IP নেই", "এই অর্ডারে IP সংরক্ষিত নেই");
      return;
    }

    setIpLoading(true);
    try {
      if (ipBlocked) {
        const res = await fetch(
          `/api/admin/blocked-ips?ip=${encodeURIComponent(initial.clientIp)}`,
          { method: "DELETE" }
        );
        const data = await res.json();
        if (!res.ok) {
          error("আনব্লক ব্যর্থ", data.error);
          return;
        }
        setIpBlocked(false);
        onIpBlockedChange?.(false);
        success("IP আনব্লক করা হয়েছে");
      } else {
        const res = await fetch("/api/admin/blocked-ips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ip: initial.clientIp,
            orderId: initial.id,
            reason: `অর্ডার সম্পাদনা`,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          error("ব্লক ব্যর্থ", data.error);
          return;
        }
        setIpBlocked(true);
        onIpBlockedChange?.(true);
        success("IP ব্লক করা হয়েছে");
      }
    } catch {
      error("ত্রুটি", "নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setIpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      email: form.email.trim() || null,
      items,
      subtotal,
      total,
      shipping: Number(form.shipping) || 0,
    };

    const url = initial
      ? `/api/admin/orders/${initial.id}`
      : "/api/admin/orders";
    const method = initial ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        error("সংরক্ষণ ব্যর্থ", data.error);
        return;
      }

      success(initial ? "অর্ডার আপডেট হয়েছে" : "কাস্টম অর্ডার তৈরি হয়েছে");
      onSuccess(data);
    } catch {
      error("সংরক্ষণ ব্যর্থ", "নেটওয়ার্ক ত্রুটি");
    } finally {
      setSaving(false);
    }
  };

  const modalTitle = initial ? "অর্ডার সম্পাদনা" : "নতুন কাস্টম অর্ডার";

  const footer = (
    <div className="flex flex-col-reverse sm:flex-row gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50"
      >
        বাতিল
      </button>
      <button
        type="submit"
        form="order-edit-form"
        disabled={saving}
        className="btn-primary flex-1 py-2.5 disabled:opacity-60"
      >
        {saving ? "সংরক্ষণ..." : "সংরক্ষণ"}
      </button>
    </div>
  );

  return (
    <AdminModal title={modalTitle} onClose={onCancel} footer={footer}>
      <form
        id="order-edit-form"
        onSubmit={handleSubmit}
        className="space-y-4 max-w-full"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">নাম</label>
            <input
              className="input-field"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ফোন</label>
            <input
              className="input-field"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              ইমেইল <span className="text-gray-400 font-normal">(ঐচ্ছিক)</span>
            </label>
            <input
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">স্ট্যাটাস</label>
            <select
              className="input-field"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">ঠিকানা</label>
            <input
              className="input-field"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">শহর</label>
            <input
              className="input-field"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
            />
          </div>
        </div>

        {initial?.clientIp && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="min-w-0">
                <p className="text-gray-500 text-xs mb-0.5">IP ঠিকানা</p>
                <p className="font-mono text-xs break-all">{initial.clientIp}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {ipBlocked ? (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                    ব্লক
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
            </div>
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">পণ্য</label>
            <button
              type="button"
              onClick={() => setItems([...items, { ...emptyItem }])}
              className="text-sm text-[var(--accent-color)] flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> যোগ
            </button>
          </div>
          <div className="overflow-x-auto -mx-1 px-1">
            <div className="min-w-[520px] space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className="input-field flex-1 min-w-[140px]"
                    placeholder="পণ্যের নাম"
                    value={item.titleBn}
                    onChange={(e) => updateItem(i, "titleBn", e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    className="input-field w-24 shrink-0"
                    placeholder="মূল্য"
                    value={item.price || ""}
                    onChange={(e) => updateItem(i, "price", e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    className="input-field w-20 shrink-0"
                    placeholder="পরি."
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(i, "quantity", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setItems(items.filter((_, idx) => idx !== i))
                    }
                    className="p-2 text-red-500 hover:bg-red-50 rounded shrink-0"
                    disabled={items.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm bg-gray-50 p-3 rounded-lg">
          <div>
            <span className="text-gray-500">সাবটোটাল</span>
            <p className="font-semibold">৳{subtotal}</p>
          </div>
          <div>
            <label className="text-gray-500">শিপিং</label>
            <input
              type="number"
              className="input-field mt-1"
              value={form.shipping}
              onChange={(e) =>
                setForm({ ...form, shipping: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <span className="text-gray-500">মোট</span>
            <p className="font-bold text-lg">৳{total}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">নোট</label>
          <textarea
            className="input-field min-h-[60px]"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
        </div>
      </form>
    </AdminModal>
  );
}
