"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "./PageHeader";
import { AdminModal } from "./AdminModal";
import { Pagination } from "./Pagination";
import { useNotification } from "./NotificationProvider";
import { formatPrice } from "@/lib/format";
import { getUnitLabel } from "@/lib/product-units";
import {
  EXPENSE_CATEGORIES,
  RETURN_STATUSES,
  STOCK_MOVEMENT_TYPES,
} from "@/lib/inventory";
import { isPaginatedResponse } from "@/lib/admin-list";
import { parseVariants } from "@/lib/product-variants";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  RotateCcw,
  Wallet,
  History,
  Plus,
  Search,
  ArrowDownCircle,
  ArrowUpCircle,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

type Tab = "summary" | "adjust" | "returns" | "expenses" | "history";

interface ProductOption {
  id: string;
  titleBn: string;
  stock: number;
  unit: string;
  variants: ReturnType<typeof parseVariants>;
}

const TAB_HELP: Record<Tab, string> = {
  summary: "এক নজরে স্টক, সতর্কতা ও খরচের সারাংশ দেখুন",
  adjust: "পণ্য বেছে নিয়ে স্টক যোগ বা কমান — ক্রয়, ক্ষতি, সমন্বয় ইত্যাদি",
  returns: "গ্রাহকের রিটার্ন রেকর্ড করুন ও অনুমোদন দিলে স্টক ফিরে আসবে",
  expenses: "দোকানের দৈনন্দিন খরচ (পরিবহন, মজুরি, প্যাকেটিং ইত্যাদি) লিখুন",
  history: "সব স্টক ইন/আউট এর সম্পূর্ণ ইতিহাস",
};

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 px-4">
      <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}

function ReturnStatusBadge({ status }: { status: string }) {
  const cfg = RETURN_STATUSES.find((s) => s.value === status);
  const label = cfg?.label ?? status;
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-800">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {label}
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-800">
        <XCircle className="w-3.5 h-3.5" />
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
      <Clock className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

function ProductSearchSelect({
  products,
  value,
  onChange,
  placeholder = "পণ্য খুঁজুন বা নির্বাচন করুন...",
}: {
  products: ProductOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.titleBn.toLowerCase().includes(q));
  }, [products, query]);

  const selected = products.find((p) => p.id === value);

  useEffect(() => {
    if (selected) setQuery(selected.titleBn);
  }, [selected]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          className="input-field input-field-search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!e.target.value.trim()) onChange("");
          }}
        />
      </div>
      {query && !value && filtered.length > 0 && (
        <ul className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto bg-white shadow-sm">
          {filtered.slice(0, 20).map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-[var(--brand-green-muted)] border-b border-gray-50 last:border-0"
                onClick={() => {
                  onChange(p.id);
                  setQuery(p.titleBn);
                }}
              >
                <span className="font-medium">{p.titleBn}</span>
                <span className="text-gray-500 ml-2">
                  স্টক: {p.stock} {getUnitLabel(p.unit)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {query && !value && filtered.length === 0 && (
        <p className="text-xs text-gray-500 px-1">কোনো পণ্য পাওয়া যায়নি</p>
      )}
    </div>
  );
}

function StockPreview({
  product,
  variantId,
}: {
  product?: ProductOption;
  variantId?: string;
}) {
  if (!product) return null;

  const variant = product.variants.find((v) => v.id === variantId);
  const stock = variant ? (variant.stock ?? 0) : product.stock;
  const label = variant ? variant.nameBn : "মূল স্টক";

  return (
    <div className="rounded-xl border-2 border-[var(--brand-green)]/20 bg-[var(--brand-green-muted)] p-4">
      <p className="text-xs text-[var(--brand-green)] font-medium mb-1">
        বর্তমান স্টক — {label}
      </p>
      <p className="text-3xl font-bold text-[var(--brand-green-dark)]">
        {stock}{" "}
        <span className="text-base font-medium">{getUnitLabel(product.unit)}</span>
      </p>
      {product.variants.length > 0 && !variantId && (
        <p className="text-xs text-amber-700 mt-2">
          ভ্যারিয়েন্ট আছে — নিচ থেকে ভ্যারিয়েন্ট বেছে নিন
        </p>
      )}
    </div>
  );
}

export function InventoryManager() {
  const [tab, setTab] = useState<Tab>("summary");
  const { success, error } = useNotification();

  const tabs: { id: Tab; label: string; icon: typeof Package }[] = [
    { id: "summary", label: "সারসংক্ষেপ", icon: Package },
    { id: "adjust", label: "স্টক সমন্বয়", icon: TrendingDown },
    { id: "returns", label: "রিটার্ন", icon: RotateCcw },
    { id: "expenses", label: "খরচ", icon: Wallet },
    { id: "history", label: "ইতিহাস", icon: History },
  ];

  return (
    <div>
      <PageHeader
        title="ইনভেন্টরি ব্যবস্থাপনা"
        description="স্টক, রিটার্ন, খরচ ও মুভমেন্ট লগ"
      />

      <div className="flex flex-wrap gap-2 mb-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors border ${
                active
                  ? "btn-tab-active border-[var(--accent-color)]"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-start gap-2 mb-6 px-1 py-2 rounded-lg bg-blue-50/80 border border-blue-100 text-sm text-blue-900">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>{TAB_HELP[tab]}</span>
      </div>

      {tab === "summary" && <SummaryTab onNavigate={setTab} />}
      {tab === "adjust" && <AdjustTab success={success} error={error} />}
      {tab === "returns" && <ReturnsTab success={success} error={error} />}
      {tab === "expenses" && <ExpensesTab success={success} error={error} />}
      {tab === "history" && <HistoryTab />}
    </div>
  );
}

function SummaryTab({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/inventory/summary")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-4 animate-pulse h-20" />
        ))}
      </div>
    );
  }
  if (!data) return null;

  const cards: {
    label: string;
    value: string;
    hint?: string;
    warn?: boolean;
    tab?: Tab;
    icon: typeof Package;
  }[] = [
    {
      label: "মোট পণ্য",
      value: String(data.totalProducts ?? 0),
      icon: Package,
    },
    {
      label: "মোট ইউনিট (স্টক)",
      value: String(data.totalUnits ?? 0),
      tab: "history",
      icon: TrendingDown,
    },
    {
      label: "স্টক মূল্য (আনুমানিক)",
      value: formatPrice(Number(data.stockValue) || 0),
      icon: Wallet,
    },
    {
      label: "কম স্টক",
      value: String(data.lowStock ?? 0),
      warn: Number(data.lowStock) > 0,
      tab: "adjust",
      icon: AlertTriangle,
    },
    {
      label: "স্টক শেষ",
      value: String(data.outOfStock ?? 0),
      warn: Number(data.outOfStock) > 0,
      tab: "adjust",
      icon: XCircle,
    },
    {
      label: "অপেক্ষমাণ রিটার্ন",
      value: String(data.pendingReturns ?? 0),
      warn: Number(data.pendingReturns) > 0,
      tab: "returns",
      icon: RotateCcw,
    },
    {
      label: "এ মাসের খরচ",
      value: formatPrice(Number(data.monthExpenses) || 0),
      tab: "expenses",
      icon: Wallet,
    },
  ];

  const lowStock =
    (data.lowStockProducts as Array<{
      titleBn: string;
      totalStock: number;
      unit: string;
    }>) ?? [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => c.tab && onNavigate(c.tab)}
              disabled={!c.tab}
              className={`text-left bg-white rounded-xl border p-4 transition-shadow ${
                c.tab ? "hover:shadow-md hover:border-[var(--accent-color)]/40 cursor-pointer" : ""
              } ${c.warn ? "border-amber-300 bg-amber-50/50" : "border-gray-200"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon
                  className={`w-5 h-5 ${c.warn ? "text-amber-600" : "text-[var(--brand-green)]"}`}
                />
                {c.tab && (
                  <span className="text-[10px] text-gray-400 uppercase">দেখুন →</span>
                )}
              </div>
              <p className="text-xs text-gray-500">{c.label}</p>
              <p
                className={`text-xl font-bold mt-1 ${
                  c.warn ? "text-amber-700" : "text-gray-900"
                }`}
              >
                {c.value}
              </p>
            </button>
          );
        })}
      </div>

      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-amber-800 font-medium">
              <AlertTriangle className="w-5 h-5" />
              কম স্টক — দ্রুত পুনরায় ভর্তি করুন
            </div>
            <button
              type="button"
              onClick={() => onNavigate("adjust")}
              className="text-xs btn-primary px-3 py-1.5"
            >
              স্টক যোগ করুন
            </button>
          </div>
          <div className="space-y-2">
            {lowStock.map((p, i) => (
              <div
                key={i}
                className="flex justify-between text-sm bg-white/80 rounded-lg px-3 py-2"
              >
                <span>{p.titleBn}</span>
                <span className="font-semibold text-amber-700">
                  মাত্র {p.totalStock} {getUnitLabel(p.unit)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdjustTab({
  success,
  error,
}: {
  success: (t: string, m?: string) => void;
  error: (t: string, m?: string) => void;
}) {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [direction, setDirection] = useState<"in" | "out">("in");
  const [type, setType] = useState("purchase");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/products?all=true")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.items ?? [];
        setProducts(
          list.map((p: Record<string, unknown>) => ({
            id: String(p.id),
            titleBn: String(p.titleBn),
            stock: Number(p.stock) || 0,
            unit: String(p.unit || "piece"),
            variants: parseVariants(p.variants),
          }))
        );
      });
  }, []);

  const selected = products.find((p) => p.id === productId);
  const quickAmounts = [1, 5, 10, 25, 50];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !quantity) return;
    if (selected && selected.variants.length > 0 && !variantId) {
      error("ভ্যারিয়েন্ট বাধ্যতামূলক", "এই পণ্যের জন্য ভ্যারিয়েন্ট নির্বাচন করুন");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/inventory/movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        variantId: variantId || undefined,
        quantity: Number(quantity),
        direction,
        type,
        note,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      error("সমন্বয় ব্যর্থ", data.error);
    } else {
      success(
        direction === "in" ? "স্টক যোগ হয়েছে ✓" : "স্টক কমানো হয়েছে ✓",
        `নতুন স্টক: ${data.stockAfter} ${getUnitLabel(selected?.unit)}`
      );
      setQuantity("");
      setNote("");
      const refreshed = await fetch("/api/admin/products?all=true").then((r) =>
        r.json()
      );
      const list = Array.isArray(refreshed) ? refreshed : refreshed.items ?? [];
      setProducts(
        list.map((p: Record<string, unknown>) => ({
          id: String(p.id),
          titleBn: String(p.titleBn),
          stock: Number(p.stock) || 0,
          unit: String(p.unit || "piece"),
          variants: parseVariants(p.variants),
        }))
      );
    }
    setSaving(false);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">স্টক আপডেট করুন</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              ১. পণ্য বেছে নিন
            </label>
            <ProductSearchSelect
              products={products}
              value={productId}
              onChange={(id) => {
                setProductId(id);
                setVariantId("");
              }}
            />
          </div>

          {selected && selected.variants.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1.5">
                ২. ভ্যারিয়েন্ট
              </label>
              <div className="flex flex-wrap gap-2">
                {selected.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariantId(v.id)}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                      variantId === v.id
                        ? "border-[var(--accent-color)] bg-[var(--brand-green-muted)] text-[var(--brand-green)] font-medium"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {v.nameBn}
                    <span className="text-gray-500 ml-1">({v.stock ?? 0})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">
              {selected?.variants.length ? "৩." : "২."} স্টক ইন না আউট?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDirection("in")}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                  direction === "in"
                    ? "border-green-500 bg-green-50 text-green-800"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <ArrowDownCircle className="w-5 h-5" />
                স্টক যোগ (+)
              </button>
              <button
                type="button"
                onClick={() => setDirection("out")}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                  direction === "out"
                    ? "border-red-400 bg-red-50 text-red-800"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <ArrowUpCircle className="w-5 h-5" />
                স্টক কমান (-)
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">ধরন</label>
              <select
                className="input-field"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {Object.entries(STOCK_MOVEMENT_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                পরিমাণ {selected ? `(${getUnitLabel(selected.unit)})` : ""}
              </label>
              <input
                type="number"
                min={1}
                className="input-field"
                placeholder="যেমন: 10"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickAmounts.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setQuantity(String(n))}
                    className="text-xs px-2.5 py-1 rounded-md border border-gray-200 hover:bg-gray-50"
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              নোট (ঐচ্ছিক)
            </label>
            <textarea
              className="input-field min-h-[70px]"
              placeholder="যেমন: সাপ্লায়ার থেকে নতুন মাল এসেছে"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={saving || !productId}
            className="btn-primary w-full py-3 text-base disabled:opacity-60"
          >
            {saving
              ? "সংরক্ষণ হচ্ছে..."
              : direction === "in"
                ? "✓ স্টক যোগ করুন"
                : "✓ স্টক কমান"}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <StockPreview product={selected} variantId={variantId} />
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 space-y-2">
          <p className="font-medium text-gray-800">💡 টিপস</p>
          <ul className="list-disc list-inside space-y-1 text-xs leading-relaxed">
            <li>নতুন মাল আসলে <strong>স্টক যোগ (+)</strong> বেছে নিন</li>
            <li>ক্ষতি/মেয়াদোত্তীর্ণ হলে <strong>স্টক কমান (-)</strong></li>
            <li>ভ্যারিয়েন্ট আছে পণ্যে — অবশ্যই ভ্যারিয়েন্ট বেছে নিন</li>
            <li>অর্ডার থেকে স্টক অটো কাটে; বাতিলে ফিরে আসে</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ReturnsTab({
  success,
  error,
}: {
  success: (t: string, m?: string) => void;
  error: (t: string, m?: string) => void;
}) {
  const [returns, setReturns] = useState<Record<string, unknown>[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [form, setForm] = useState({
    productId: "",
    variantId: "",
    quantity: "1",
    orderNumber: "",
    reason: "",
    refundAmount: "",
    note: "",
    status: "pending",
  });

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/inventory/returns?page=${page}`);
    const data = await res.json();
    if (isPaginatedResponse(data)) {
      setReturns(data.items as Record<string, unknown>[]);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPageSize(data.pageSize);
    }
  }, [page]);

  useEffect(() => {
    load();
    fetch("/api/admin/products?all=true")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.items ?? [];
        setProducts(
          list.map((p: Record<string, unknown>) => ({
            id: String(p.id),
            titleBn: String(p.titleBn),
            stock: Number(p.stock) || 0,
            unit: String(p.unit || "piece"),
            variants: parseVariants(p.variants),
          }))
        );
      });
  }, [load]);

  const selected = products.find((p) => p.id === form.productId);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === form.productId);
    if (!product) return;

    const variant = product.variants.find((v) => v.id === form.variantId);

    const res = await fetch("/api/admin/inventory/returns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: form.productId,
        productName: variant
          ? `${product.titleBn} (${variant.nameBn})`
          : product.titleBn,
        variantId: form.variantId || null,
        variantName: variant?.nameBn || null,
        quantity: Number(form.quantity),
        unit: product.unit,
        orderNumber: form.orderNumber || null,
        reason: form.reason,
        refundAmount: Number(form.refundAmount) || 0,
        note: form.note,
        status: form.status,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      error("রিটার্ন ব্যর্থ", data.error);
      return;
    }
    success("রিটার্ন রেকর্ড তৈরি হয়েছে");
    setShowForm(false);
    setForm({
      productId: "",
      variantId: "",
      quantity: "1",
      orderNumber: "",
      reason: "",
      refundAmount: "",
      note: "",
      status: "pending",
    });
    load();
  };

  const approve = async (id: string) => {
    if (!confirm("অনুমোদন করলে স্টকে পণ্য ফিরে যাবে। নিশ্চিত?")) return;
    const res = await fetch(`/api/admin/inventory/returns/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
    });
    const data = await res.json();
    if (!res.ok) {
      error("অনুমোদন ব্যর্থ", data.error);
      return;
    }
    success("রিটার্ন অনুমোদিত — স্টক যোগ হয়েছে");
    load();
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          মোট {total}টি রিটার্ন রেকর্ড
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2"
        >
          <Plus className="w-4 h-4" /> নতুন রিটার্ন
        </button>
      </div>

      {showForm && (
        <AdminModal title="নতুন রিটার্ন রেকর্ড" onClose={() => setShowForm(false)} maxWidth="md">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">পণ্য</label>
              <ProductSearchSelect
                products={products}
                value={form.productId}
                onChange={(id) =>
                  setForm({ ...form, productId: id, variantId: "" })
                }
              />
            </div>
            {selected && selected.variants.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">ভ্যারিয়েন্ট</label>
                <select
                  className="input-field"
                  value={form.variantId}
                  onChange={(e) =>
                    setForm({ ...form, variantId: e.target.value })
                  }
                  required
                >
                  <option value="">ভ্যারিয়েন্ট নির্বাচন করুন</option>
                  {selected.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nameBn}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">পরিমাণ</label>
                <input
                  type="number"
                  min={1}
                  className="input-field"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">অর্ডার নম্বর</label>
                <input
                  className="input-field"
                  placeholder="ঐচ্ছিক"
                  value={form.orderNumber}
                  onChange={(e) =>
                    setForm({ ...form, orderNumber: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">রিটার্নের কারণ</label>
              <input
                className="input-field"
                placeholder="যেমন: পণ্য নষ্ট, ভুল পণ্য"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">রিফান্ড (৳)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="0"
                  value={form.refundAmount}
                  onChange={(e) =>
                    setForm({ ...form, refundAmount: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">স্ট্যাটাস</label>
                <select
                  className="input-field"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {RETURN_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-2.5">
              রিটার্ন সংরক্ষণ করুন
            </button>
          </form>
        </AdminModal>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        {returns.length === 0 ? (
          <EmptyState message="এখনো কোনো রিটার্ন নেই — উপরে 'নতুন রিটার্ন' বাটনে ক্লিক করুন" />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3">রিটার্ন #</th>
                    <th className="text-left px-4 py-3">পণ্য</th>
                    <th className="text-left px-4 py-3">পরিমাণ</th>
                    <th className="text-left px-4 py-3">রিফান্ড</th>
                    <th className="text-left px-4 py-3">স্ট্যাটাস</th>
                    <th className="text-right px-4 py-3">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {returns.map((r) => (
                    <tr key={String(r.id)} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-mono text-xs">{String(r.returnNumber)}</td>
                      <td className="px-4 py-3">{String(r.productName)}</td>
                      <td className="px-4 py-3">
                        {String(r.quantity)} {getUnitLabel(String(r.unit))}
                      </td>
                      <td className="px-4 py-3">
                        {Number(r.refundAmount) > 0
                          ? formatPrice(Number(r.refundAmount))
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <ReturnStatusBadge status={String(r.status)} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {r.status === "pending" && (
                          <button
                            onClick={() => approve(String(r.id))}
                            className="btn-secondary text-xs px-3 py-1.5"
                          >
                            অনুমোদন করুন
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y">
              {returns.map((r) => (
                <div key={String(r.id)} className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs text-gray-500">
                      {String(r.returnNumber)}
                    </span>
                    <ReturnStatusBadge status={String(r.status)} />
                  </div>
                  <p className="font-medium">{String(r.productName)}</p>
                  <p className="text-sm text-gray-600">
                    {String(r.quantity)} {getUnitLabel(String(r.unit))}
                    {Number(r.refundAmount) > 0 &&
                      ` · রিফান্ড ${formatPrice(Number(r.refundAmount))}`}
                  </p>
                  {r.status === "pending" && (
                    <button
                      onClick={() => approve(String(r.id))}
                      className="btn-secondary w-full py-2 text-sm"
                    >
                      অনুমোদন করুন
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

function ExpensesTab({
  success,
  error,
}: {
  success: (t: string, m?: string) => void;
  error: (t: string, m?: string) => void;
}) {
  const [expenses, setExpenses] = useState<Record<string, unknown>[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    titleBn: "",
    category: "other",
    amount: "",
    note: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/inventory/expenses?page=${page}`);
    const data = await res.json();
    if (isPaginatedResponse(data)) {
      setExpenses(data.items as Record<string, unknown>[]);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPageSize(data.pageSize);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/inventory/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: Number(form.amount),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      error("খরচ যোগ ব্যর্থ", data.error);
      return;
    }
    success("খরচ যোগ হয়েছে");
    setShowForm(false);
    setForm({
      title: "",
      titleBn: "",
      category: "other",
      amount: "",
      note: "",
      date: new Date().toISOString().slice(0, 10),
    });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই খরচ মুছে ফেলবেন?")) return;
    await fetch(`/api/admin/inventory/expenses/${id}`, { method: "DELETE" });
    success("খরচ মুছে ফেলা হয়েছে");
    load();
  };

  const monthTotal = expenses.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          এই পৃষ্ঠায় মোট খরচ:{" "}
          <span className="font-semibold text-gray-800">
            {formatPrice(monthTotal)}
          </span>
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2"
        >
          <Plus className="w-4 h-4" /> নতুন খরচ
        </button>
      </div>

      {showForm && (
        <AdminModal title="নতুন খরচ যোগ করুন" onClose={() => setShowForm(false)} maxWidth="md">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">খরচের নাম</label>
              <input
                className="input-field"
                placeholder="যেমন: পরিবহন খরচ"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ক্যাটাগরি</label>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">পরিমাণ (৳)</label>
                <input
                  type="number"
                  min={1}
                  className="input-field"
                  placeholder="500"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">তারিখ</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">নোট (ঐচ্ছিক)</label>
              <textarea
                className="input-field min-h-[60px]"
                placeholder="বিস্তারিত লিখুন..."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-primary w-full py-2.5">
              খরচ সংরক্ষণ করুন
            </button>
          </form>
        </AdminModal>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        {expenses.length === 0 ? (
          <EmptyState message="এখনো কোনো খরচ রেকর্ড নেই" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3">খরচের নাম</th>
                  <th className="text-left px-4 py-3">ক্যাটাগরি</th>
                  <th className="text-left px-4 py-3">পরিমাণ</th>
                  <th className="text-left px-4 py-3">তারিখ</th>
                  <th className="text-right px-4 py-3">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {expenses.map((e) => (
                  <tr key={String(e.id)} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium">{String(e.title)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {EXPENSE_CATEGORIES.find((c) => c.value === e.category)
                          ?.label ?? String(e.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[var(--brand-green)]">
                      {formatPrice(Number(e.amount))}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(String(e.date)).toLocaleDateString("bn-BD")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(String(e.id))}
                        className="text-xs text-red-600 hover:underline px-2 py-1"
                      >
                        মুছুন
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

function HistoryTab() {
  const [movements, setMovements] = useState<Record<string, unknown>[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`/api/admin/inventory/movements?page=${page}`)
      .then((r) => r.json())
      .then((data) => {
        if (isPaginatedResponse(data)) {
          setMovements(data.items as Record<string, unknown>[]);
          setTotal(data.total);
          setTotalPages(data.totalPages);
          setPageSize(data.pageSize);
        }
      });
  }, [page]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return movements;
    return movements.filter((m) =>
      String(m.productName).toLowerCase().includes(q)
    );
  }, [movements, search]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          className="input-field input-field-search"
          placeholder="পণ্যের নাম দিয়ে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto">
        {filtered.length === 0 ? (
          <EmptyState
            message={
              search
                ? "এই নামে কোনো রেকর্ড নেই"
                : "এখনো কোনো স্টক মুভমেন্ট নেই"
            }
          />
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">তারিখ</th>
                <th className="text-left px-4 py-3">পণ্য</th>
                <th className="text-left px-4 py-3">ধরন</th>
                <th className="text-left px-4 py-3">পরিবর্তন</th>
                <th className="text-left px-4 py-3">স্টক (আগে → পরে)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((m) => (
                <tr key={String(m.id)} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                    {new Date(String(m.createdAt)).toLocaleString("bn-BD")}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{String(m.productName)}</span>
                    {m.variantName ? (
                      <span className="text-gray-500 text-xs block">
                        {String(m.variantName)}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {STOCK_MOVEMENT_TYPES[
                      m.type as keyof typeof STOCK_MOVEMENT_TYPES
                    ] ?? String(m.type)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        m.direction === "in" ? "text-green-700" : "text-red-600"
                      }`}
                    >
                      {m.direction === "in" ? (
                        <ArrowDownCircle className="w-4 h-4" />
                      ) : (
                        <ArrowUpCircle className="w-4 h-4" />
                      )}
                      {m.direction === "in" ? "+" : "-"}
                      {String(m.quantity)} {getUnitLabel(String(m.unit))}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 tabular-nums">
                    {String(m.stockBefore)} →{" "}
                    <span className="font-medium text-gray-800">
                      {String(m.stockAfter)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
