"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "./PageHeader";
import { AdminModal } from "./AdminModal";
import { SearchFilterBar } from "./SearchFilterBar";
import { useNotification } from "./NotificationProvider";
import { Pagination } from "./Pagination";
import { isPaginatedResponse } from "@/lib/admin-list";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/format";

interface Shipping {
  id: string;
  name: string;
  nameBn: string;
  price: number;
  active: boolean;
}

const emptyForm = { name: "", nameBn: "", price: "", active: true };

export function ShippingManager() {
  const [items, setItems] = useState<Shipping[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [saving, setSaving] = useState(false);
  const { success, error: notifyError } = useNotification();

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (activeFilter) params.set("active", activeFilter);
    params.set("page", String(page));
    const res = await fetch(`/api/admin/shipping?${params}`);
    const data = await res.json();
    if (isPaginatedResponse<Shipping>(data)) {
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPageSize(data.pageSize);
    } else {
      setItems(data);
    }
    setLoading(false);
  }, [search, activeFilter, page]);

  useEffect(() => {
    setPage(1);
  }, [search, activeFilter]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item: Shipping) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      nameBn: item.nameBn,
      price: String(item.price),
      active: item.active,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url = editingId
      ? `/api/admin/shipping/${editingId}`
      : "/api/admin/shipping";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        nameBn: form.nameBn,
        price: Number(form.price),
        active: form.active,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      notifyError("সংরক্ষণ ব্যর্থ", data.error);
      setSaving(false);
      return;
    }

    success(editingId ? "শিপিং আপডেট হয়েছে" : "শিপিং তৈরি হয়েছে");
    setShowForm(false);
    setSaving(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই শিপিং অপশন মুছে ফেলবেন?")) return;
    const res = await fetch(`/api/admin/shipping/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      notifyError("মুছা ব্যর্থ", data.error);
      return;
    }
    success("শিপিং মুছে ফেলা হয়েছে");
    load();
  };

  return (
    <div>
      <PageHeader
        title="শিপিং ব্যবস্থাপনা"
        description="চেকআউটে দেখানো শিপিং অপশন তৈরি করুন (পণ্য ফ্রি শিপিং না হলে)"
        action={
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-2">
            <Plus className="w-4 h-4" />
            নতুন শিপিং
          </button>
        }
      />

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="শিপিং খুঁজুন..."
      >
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
        >
          <option value="">সব</option>
          <option value="true">সক্রিয়</option>
          <option value="false">নিষ্ক্রিয়</option>
        </select>
      </SearchFilterBar>

      {showForm && (
        <AdminModal
          title={editingId ? "শিপিং সম্পাদনা" : "নতুন শিপিং"}
          onClose={() => setShowForm(false)}
          maxWidth="md"
        >
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">নাম (EN)</label>
                <input
                  className="input-field"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">নাম (বাংলা)</label>
                <input
                  className="input-field"
                  value={form.nameBn}
                  onChange={(e) => setForm({ ...form, nameBn: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">মূল্য (৳)</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                <span className="text-sm">সক্রিয়</span>
              </label>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2 disabled:opacity-60">
                  {saving ? "সংরক্ষণ..." : "সংরক্ষণ"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  বাতিল
                </button>
              </div>
            </form>
        </AdminModal>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-gray-500">লোড হচ্ছে...</p>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-gray-500">কোনো শিপিং অপশন নেই</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-5 py-3">নাম</th>
                <th className="text-left px-5 py-3">মূল্য</th>
                <th className="text-left px-5 py-3">স্ট্যাটাস</th>
                <th className="text-right px-5 py-3">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="font-medium">{item.nameBn}</div>
                    <div className="text-gray-500 text-xs">{item.name}</div>
                  </td>
                  <td className="px-5 py-3 font-medium">{formatPrice(item.price)}</td>
                  <td className="px-5 py-3">
                    {item.active ? (
                      <span className="text-green-600 text-xs">সক্রিয়</span>
                    ) : (
                      <span className="text-gray-400 text-xs">নিষ্ক্রিয়</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openEdit(item)} className="p-1.5 text-gray-500 hover:text-[var(--accent-color)] inline-flex">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-500 hover:text-red-500 inline-flex ml-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
