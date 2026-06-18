"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "./PageHeader";
import { AdminModal } from "./AdminModal";
import { SearchFilterBar } from "./SearchFilterBar";
import { useNotification } from "./NotificationProvider";
import { Pagination } from "./Pagination";
import { isPaginatedResponse } from "@/lib/admin-list";
import { Plus, Trash2 } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
}

const emptyForm = {
  email: "",
  password: "",
  name: "",
  role: "ADMIN",
};

export function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
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
    if (roleFilter) params.set("role", roleFilter);
    params.set("page", String(page));
    const res = await fetch(`/api/admin/users?${params}`);
    if (res.ok) {
      const data = await res.json();
      if (isPaginatedResponse<User>(data)) {
        setUsers(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setPageSize(data.pageSize);
      } else {
        setUsers(data);
      }
    }
    setLoading(false);
  }, [search, roleFilter, page]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      notifyError("তৈরি ব্যর্থ", data.error);
      setSaving(false);
      return;
    }

    success("অ্যাডমিন তৈরি হয়েছে");
    setShowForm(false);
    setForm(emptyForm);
    setSaving(false);
    load();
  };

  const toggleActive = async (user: User) => {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !user.active }),
    });
    if (res.ok) {
      success(user.active ? "ইউজার নিষ্ক্রিয়" : "ইউজার সক্রিয়");
      load();
    } else {
      const data = await res.json();
      notifyError("আপডেট ব্যর্থ", data.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই ইউজার মুছে ফেলবেন?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      notifyError("মুছা ব্যর্থ", data.error);
      return;
    }
    success("ইউজার মুছে ফেলা হয়েছে");
    load();
  };

  return (
    <div>
      <PageHeader
        title="ইউজার ব্যবস্থাপনা"
        description="অ্যাডমিন তৈরি ও পরিচালনা করুন (শুধু সুপার অ্যাডমিন)"
        action={
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 px-4 py-2">
            <Plus className="w-4 h-4" />
            নতুন অ্যাডমিন
          </button>
        }
      />

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="নাম বা ইমেইল খুঁজুন..."
      >
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">সব রোল</option>
          <option value="ADMIN">অ্যাডমিন</option>
          <option value="SUPER_ADMIN">সুপার অ্যাডমিন</option>
        </select>
      </SearchFilterBar>

      {showForm && (
        <AdminModal
          title="নতুন অ্যাডমিন"
          onClose={() => setShowForm(false)}
          maxWidth="md"
        >
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">নাম</label>
                <input
                  className="input-field"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ইমেইল</label>
                <input
                  type="email"
                  className="input-field"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">পাসওয়ার্ড</label>
                <input
                  type="password"
                  className="input-field"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">রোল</label>
                <select
                  className="input-field"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="ADMIN">অ্যাডমিন</option>
                  <option value="SUPER_ADMIN">সুপার অ্যাডমিন</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2 disabled:opacity-60">
                  {saving ? "তৈরি..." : "তৈরি করুন"}
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
        ) : users.length === 0 ? (
          <p className="p-8 text-center text-gray-500">কোনো ইউজার নেই</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-5 py-3">নাম</th>
                <th className="text-left px-5 py-3">ইমেইল</th>
                <th className="text-left px-5 py-3">রোল</th>
                <th className="text-left px-5 py-3">স্ট্যাটাস</th>
                <th className="text-right px-5 py-3">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">{user.name}</td>
                  <td className="px-5 py-3">{user.email}</td>
                  <td className="px-5 py-3">
                    {user.role === "SUPER_ADMIN" ? "সুপার অ্যাডমিন" : "অ্যাডমিন"}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleActive(user)}
                      className={`text-xs px-2 py-1 rounded ${
                        user.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {user.active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-1.5 text-gray-500 hover:text-red-500 inline-flex"
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
