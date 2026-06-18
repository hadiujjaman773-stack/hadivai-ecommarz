"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "./PageHeader";
import { AdminModal } from "./AdminModal";
import { SearchFilterBar } from "./SearchFilterBar";
import { ImageUploader } from "./ImageUploader";
import { useNotification } from "./NotificationProvider";
import { Pagination } from "./Pagination";
import { isPaginatedResponse } from "@/lib/admin-list";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { slugify } from "@/lib/slug";

interface Category {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  image: string | null;
  _count?: { products: number };
}

const emptyForm = { name: "", nameBn: "", slug: "", image: "" };

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
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
    params.set("page", String(page));
    const res = await fetch(`/api/admin/categories?${params}`);
    const data = await res.json();
    if (isPaginatedResponse<Category>(data)) {
      setCategories(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPageSize(data.pageSize);
    } else {
      setCategories(data);
    }
    setLoading(false);
  }, [search, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      nameBn: cat.nameBn,
      slug: cat.slug,
      image: cat.image || "",
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url = editingId
      ? `/api/admin/categories/${editingId}`
      : "/api/admin/categories";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        slug: form.slug || slugify(form.name),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      notifyError("সংরক্ষণ ব্যর্থ", data.error);
      setSaving(false);
      return;
    }

    success(editingId ? "ক্যাটাগরি আপডেট হয়েছে" : "ক্যাটাগরি তৈরি হয়েছে");
    setShowForm(false);
    setSaving(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই ক্যাটাগরি মুছে ফেলবেন?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      notifyError("মুছা ব্যর্থ", data.error);
      return;
    }
    success("ক্যাটাগরি মুছে ফেলা হয়েছে");
    load();
  };

  return (
    <div>
      <PageHeader
        title="ক্যাটাগরি ব্যবস্থাপনা"
        description="পণ্যের ক্যাটাগরি তৈরি ও সম্পাদনা করুন"
        action={
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-2">
            <Plus className="w-4 h-4" />
            নতুন ক্যাটাগরি
          </button>
        }
      />

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="ক্যাটাগরি খুঁজুন..."
      />

      {showForm && (
        <AdminModal
          title={editingId ? "ক্যাটাগরি সম্পাদনা" : "নতুন ক্যাটাগরি"}
          onClose={() => setShowForm(false)}
          maxWidth="md"
        >
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">নাম (EN)</label>
                <input
                  className="input-field"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                      slug: editingId ? form.slug : slugify(e.target.value),
                    })
                  }
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
                <label className="block text-sm font-medium mb-1">স্লাগ</label>
                <input
                  className="input-field"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>
              <ImageUploader
                label="ইমেজ"
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 py-2 disabled:opacity-60"
                >
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
        ) : categories.length === 0 ? (
          <p className="p-8 text-center text-gray-500">কোনো ক্যাটাগরি নেই</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-5 py-3">নাম</th>
                <th className="text-left px-5 py-3">স্লাগ</th>
                <th className="text-left px-5 py-3">পণ্য</th>
                <th className="text-right px-5 py-3">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="font-medium">{cat.nameBn}</div>
                    <div className="text-gray-500 text-xs">{cat.name}</div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{cat.slug}</td>
                  <td className="px-5 py-3">{cat._count?.products ?? 0}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 text-gray-500 hover:text-[var(--accent-color)] inline-flex"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 text-gray-500 hover:text-red-500 inline-flex ml-1"
                    >
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
