"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "./PageHeader";
import { StatusBadge } from "./StatusBadge";
import { SearchFilterBar } from "./SearchFilterBar";
import { CustomOrderForm } from "./CustomOrderForm";
import { OrderViewModal } from "./OrderViewModal";
import { useNotification } from "./NotificationProvider";
import { Pagination } from "./Pagination";
import { isPaginatedResponse } from "@/lib/admin-list";
import { formatPrice } from "@/lib/format";
import { getDhakaTodayString } from "@/lib/date-filter";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
} from "@/lib/order-status";
import { Plus, Eye, Pencil, Trash2, FileEdit, Calendar } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  fullName: string;
  phone: string;
  total: number;
  status: string;
  isCustom: boolean;
  createdAt: string;
}

export function OrderManager() {
  const searchParams = useSearchParams();
  const { success, error } = useNotification();
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [search, setSearch] = useState("");
  const [customFilter, setCustomFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [todayOnly, setTodayOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Record<string, unknown> | null>(null);
  const [editingIpBlocked, setEditingIpBlocked] = useState(false);
  const [viewOrder, setViewOrder] = useState<
    Parameters<typeof OrderViewModal>[0]["order"] | null
  >(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    if (customFilter) params.set("isCustom", customFilter);
    if (todayOnly) {
      params.set("today", "true");
    } else {
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
    }
    params.set("page", String(page));

    const res = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    if (isPaginatedResponse<Order>(data)) {
      setOrders(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPageSize(data.pageSize);
    } else {
      setOrders(data);
    }
    setLoading(false);
  }, [status, search, customFilter, dateFrom, dateTo, todayOnly, page]);

  useEffect(() => {
    setPage(1);
  }, [status, search, customFilter, dateFrom, dateTo, todayOnly]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const handleDelete = async (order: Order) => {
    if (!confirm(`অর্ডার ${order.orderNumber} মুছে ফেলবেন?`)) return;

    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      error("মুছা ব্যর্থ", data.error);
      return;
    }
    success("অর্ডার মুছে ফেলা হয়েছে");
    load();
  };

  const openEdit = async (order: Order) => {
    const res = await fetch(`/api/admin/orders/${order.id}`);
    const data = await res.json();
    if (!res.ok) {
      error("লোড ব্যর্থ", data.error);
      return;
    }
    setEditingOrder(data);
    setEditingIpBlocked(Boolean(data.ipBlocked));
    setShowForm(true);
  };

  const openView = async (order: Order) => {
    setViewingId(order.id);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`);
      const data = await res.json();
      if (!res.ok) {
        error("লোড ব্যর্থ", data.error);
        return;
      }
      setViewOrder({
        ...data,
        createdAt:
          typeof data.createdAt === "string"
            ? data.createdAt
            : new Date(data.createdAt).toISOString(),
      });
    } catch {
      error("লোড ব্যর্থ", "নেটওয়ার্ক ত্রুটি");
    } finally {
      setViewingId(null);
    }
  };

  const toggleToday = () => {
    setTodayOnly((prev) => {
      const next = !prev;
      if (next) {
        setDateFrom("");
        setDateTo("");
      }
      return next;
    });
  };

  return (
    <div>
      <PageHeader
        title="অর্ডার ব্যবস্থাপনা"
        description="সকল অর্ডার দেখুন, কাস্টম অর্ডার তৈরি ও স্ট্যাটাস আপডেট করুন"
        action={
          <button
            onClick={() => {
              setEditingOrder(null);
              setShowForm(true);
            }}
            className="btn-primary flex items-center gap-2 px-4 py-2"
          >
            <Plus className="w-4 h-4" />
            কাস্টম অর্ডার
          </button>
        }
      />

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="অর্ডার #, নাম, ফোন খুঁজুন..."
      >
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">সব স্ট্যাটাস</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={customFilter}
          onChange={(e) => setCustomFilter(e.target.value)}
        >
          <option value="">সব অর্ডার</option>
          <option value="true">কাস্টম</option>
          <option value="false">ওয়েবসাইট</option>
        </select>
      </SearchFilterBar>

      <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4 items-start sm:items-center">
        <button
          type="button"
          onClick={toggleToday}
          className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
            todayOnly
              ? "btn-tab-active border-[var(--accent-color)]"
              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Calendar className="w-4 h-4" />
          আজকের অর্ডার
        </button>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <input
            type="date"
            className="input-field py-2 text-sm w-full sm:w-auto"
            value={dateFrom}
            max={dateTo || getDhakaTodayString()}
            disabled={todayOnly}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setTodayOnly(false);
            }}
          />
          <span className="text-gray-400 hidden sm:inline">—</span>
          <input
            type="date"
            className="input-field py-2 text-sm w-full sm:w-auto"
            value={dateTo}
            min={dateFrom || undefined}
            max={getDhakaTodayString()}
            disabled={todayOnly}
            onChange={(e) => {
              setDateTo(e.target.value);
              setTodayOnly(false);
            }}
          />
          {(dateFrom || dateTo || todayOnly) && (
            <button
              type="button"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                setTodayOnly(false);
              }}
              className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1"
            >
              রিসেট
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <CustomOrderForm
          initial={
            editingOrder
              ? (editingOrder as Parameters<typeof CustomOrderForm>[0]["initial"])
              : undefined
          }
          ipBlocked={editingIpBlocked}
          onSuccess={() => {
            setShowForm(false);
            setEditingOrder(null);
            setEditingIpBlocked(false);
            load();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingOrder(null);
            setEditingIpBlocked(false);
          }}
        />
      )}

      {viewOrder && (
        <OrderViewModal order={viewOrder} onClose={() => setViewOrder(null)} />
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-gray-500">লোড হচ্ছে...</p>
        ) : orders.length === 0 ? (
          <p className="p-8 text-center text-gray-500">কোনো অর্ডার নেই</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-5 py-3">অর্ডার #</th>
                  <th className="text-left px-5 py-3">গ্রাহক</th>
                  <th className="text-left px-5 py-3">ফোন</th>
                  <th className="text-left px-5 py-3">মোট</th>
                  <th className="text-left px-5 py-3">টাইপ</th>
                  <th className="text-left px-5 py-3">স্ট্যাটাস</th>
                  <th className="text-left px-5 py-3">তারিখ</th>
                  <th className="text-right px-5 py-3">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-[var(--accent-color)] hover:underline font-medium"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3">{order.fullName}</td>
                    <td className="px-5 py-3">{order.phone}</td>
                    <td className="px-5 py-3 font-medium">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-5 py-3">
                      {order.isCustom ? (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          কাস্টম
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">ওয়েব</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("bn-BD")}
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openView(order)}
                        disabled={viewingId === order.id}
                        className="p-1.5 text-gray-500 hover:text-[var(--accent-color)] inline-flex disabled:opacity-50"
                        title="দেখুন"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="p-1.5 text-gray-500 hover:text-[var(--accent-color)] inline-flex ml-1"
                        title="বিস্তারিত / স্ট্যাটাস"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEdit(order)}
                        className="p-1.5 text-gray-500 hover:text-[var(--accent-color)] inline-flex ml-1"
                        title="অর্ডার সম্পাদনা"
                      >
                        <FileEdit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(order)}
                        className="p-1.5 text-gray-500 hover:text-red-500 inline-flex ml-1"
                        title="মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
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
