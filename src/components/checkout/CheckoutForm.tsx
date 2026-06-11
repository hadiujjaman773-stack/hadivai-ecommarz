"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { SITE } from "@/data/seed-data";

export function CheckoutForm() {
  const { items, subtotal, totalItems, updateQuantity, removeItem, clearCart } =
    useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cityType, setCityType] = useState<"outside" | "inside" | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const shipping =
    cityType === "inside"
      ? SITE.shippingInsideDhaka
      : cityType === "outside"
        ? SITE.shippingOutsideDhaka
        : 0;
  const total = subtotal + shipping;

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    note: "",
  });

  const handleSubmit = async () => {
    if (items.length === 0) {
      setError("কার্ট খালি আছে");
      return;
    }
    if (!form.fullName.trim() || !form.address.trim()) {
      setError("পূর্ণ নাম ও ঠিকানা প্রয়োজন");
      return;
    }
    if (!cityType) {
      setError("একটি শহর নির্বাচন করুন");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          city: cityType === "inside" ? "ঢাকার ভেতরে" : "ঢাকার বাহিরে",
          district: "",
          items,
          subtotal,
          shipping,
          total,
        }),
      });
      if (!res.ok) throw new Error("অর্ডার জমা দিতে সমস্যা হয়েছে");
      const data = await res.json();
      clearCart();
      router.push(`/order-success?order=${data.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "কিছু ভুল হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl text-gray-600 mb-6">আপনার কার্ট খালি</p>
        <Link
          href="/"
          className="inline-block btn-primary px-8 py-3 rounded-lg font-semibold"
        >
          কেনাকাটা শুরু করুন
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">অর্ডার করতে ফর্মটি পূরণ করুন</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form
          className="lg:col-span-2 gap-"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">শিপিং তথ্য</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
              <div className="md:col-span-2">
                <label className="block text-black font-semibold mb-1">
                  পূর্ণ নাম
                </label>
                <input
                  required
                  className="input-field"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-black font-semibold mb-1">
                  ফোন
                </label>
                <input
                  type="tel"
                  className="input-field"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-black font-semibold mb-1">
                  ঠিকানা
                </label>
                <input
                  required
                  className="input-field"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-black font-semibold mb-1">
                  শহর
                </label>
                <div className="space-y-2">
                  <label className="w-full flex items-center justify-between rounded-md border p-3 text-sm transition-colors cursor-pointer border-gray-300 bg-gray-50 text-gray-800 hover:border-gray-400">
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="city"
                        className="h-4 w-4 accent-violet-600"
                        checked={cityType === "outside"}
                        onChange={() => setCityType("outside")}
                      />
                      <span className="font-medium">ঢাকার বাহিরে</span>
                    </span>
                    <span className="text-gray-900">
                      {formatPrice(SITE.shippingOutsideDhaka)}
                    </span>
                  </label>
                  <label className="w-full flex items-center justify-between rounded-md border p-3 text-sm transition-colors cursor-pointer border-gray-300 bg-gray-50 text-gray-800 hover:border-gray-400">
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="city"
                        className="h-4 w-4 accent-violet-600"
                        checked={cityType === "inside"}
                        onChange={() => setCityType("inside")}
                      />
                      <span className="font-medium">ঢাকার ভেতরে</span>
                    </span>
                    <span className="text-gray-900">
                      {formatPrice(SITE.shippingInsideDhaka)}
                    </span>
                  </label>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-black font-semibold mb-1">
                  অর্ডার নোট
                </label>
                <textarea
                  className="input-field min-h-[50px]"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="button"
                  className="text-sm text-amber-700 hover:text-amber-800 underline"
                  onClick={() => setShowHelp((v) => !v)}
                >
                  আমি অর্ডার দিতে পারছি না কেন?
                </button>
                {showHelp && (
                  <p className="mt-2 text-sm text-gray-600">
                    নিশ্চিত করুন পূর্ণ নাম, ঠিকানা ও শহর নির্বাচন করা হয়েছে।
                    কার্টে অন্তত একটি পণ্য থাকতে হবে। সমস্যা থাকলে WhatsApp বা
                    ফোনে যোগাযোগ করুন।
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 lg:sticky lg:top-4 h-fit">
          <h2 className="text-lg font-semibold mb-4">অর্ডারের সংক্ষিপ্তসার</h2>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={`${item.productId}-${item.size ?? ""}`}
                className="flex items-center gap-3"
              >
                <div className="relative w-14 h-14 rounded-md overflow-hidden ring-1 ring-gray-200 flex-shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.titleBn}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.titleBn}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {item.size
                      ? `সাইজ নির্বাচন করুন: ${item.size}`
                      : `#${index + 1}`}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="inline-flex items-center border border-gray-300 rounded-md">
                      <button
                        type="button"
                        className="px-2 py-1.5 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        aria-label="পরিমাণ কমান"
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity - 1,
                            item.size
                          )
                        }
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        readOnly
                        inputMode="decimal"
                        className="w-16 px-1 py-1 text-sm text-center border-none focus:ring-0 focus:outline-none bg-transparent"
                        type="text"
                        value={item.quantity}
                      />
                      <button
                        type="button"
                        className="px-2 py-1.5 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        aria-label="পরিমাণ বাড়ান"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity + 1,
                            item.size
                          )
                        }
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                      aria-label="আইটেম মুছুন"
                      onClick={() => removeItem(item.productId, item.size)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">আইটেম</span>
              <span className="font-medium">{totalItems}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">সাবটোটাল</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">শিপিং</span>
              <span className="font-medium">
                {cityType === null
                  ? "একটি শহর নির্বাচন করুন"
                  : formatPrice(shipping)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">কর</span>
              <span className="font-medium">{formatPrice(0)}</span>
            </div>
            <div className="pt-2 mt-2 border-t flex justify-between">
              <span className="text-gray-900 font-semibold">মোট</span>
              <span className="text-gray-900 font-bold">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-3">{error}</p>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="btn-primary w-full py-2 rounded mt-4 disabled:opacity-60"
          >
            {loading
              ? "অর্ডার জমা হচ্ছে..."
              : `অর্ডার করুন - ${formatPrice(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
