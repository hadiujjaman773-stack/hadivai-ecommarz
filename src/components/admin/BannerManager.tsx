"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { AdminModal } from "./AdminModal";
import { ImageUploader } from "./ImageUploader";
import { useNotification } from "./NotificationProvider";

interface Banner {
  id: string;
  title: string;
  titleBn: string;
  subtitle: string | null;
  subtitleBn: string | null;
  image: string;
  link: string | null;
  order: number;
  isMain: boolean;
  active: boolean;
}

const emptyForm = {
  title: "",
  titleBn: "",
  subtitle: "",
  subtitleBn: "",
  image: "",
  link: "",
  active: true,
  isMain: false,
};

export function BannerManager() {
  const [items, setItems] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { success, error: notifyError } = useNotification();

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/banners");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item: Banner) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      titleBn: item.titleBn,
      subtitle: item.subtitle || "",
      subtitleBn: item.subtitleBn || "",
      image: item.image,
      link: item.link || "",
      active: item.active,
      isMain: item.isMain,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image.trim()) {
      notifyError("ব্যানার ইমেজ প্রয়োজন");
      return;
    }

    setSaving(true);
    const url = editingId
      ? `/api/admin/banners/${editingId}`
      : "/api/admin/banners";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        title: form.title.trim() || form.titleBn.trim() || "Banner",
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      notifyError("সংরক্ষণ ব্যর্থ", data.error);
      setSaving(false);
      return;
    }

    if (!editingId && form.isMain) {
      await fetch(`/api/admin/banners/${data.id}/main`, { method: "POST" });
    }

    success(editingId ? "ব্যানার আপডেট হয়েছে" : "ব্যানার যোগ হয়েছে");
    setShowForm(false);
    setSaving(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই ব্যানার মুছে ফেলবেন?")) return;
    const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      notifyError("মুছা ব্যর্থ", data.error);
      return;
    }
    success("ব্যানার মুছে ফেলা হয়েছে");
    load();
  };

  const handleSetMain = async (id: string) => {
    const res = await fetch(`/api/admin/banners/${id}/main`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      notifyError("মেইন ব্যানার সেট ব্যর্থ", data.error);
      return;
    }
    success("মেইন ব্যানার সেট হয়েছে");
    load();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">হোমপেজ ব্যানার</h2>
          <p className="text-sm text-gray-500 mt-1">
            ব্যানার যোগ, সম্পাদনা, মুছুন এবং মেইন ব্যানার সেট করুন
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          নতুন ব্যানার
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">লোড হচ্ছে...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-sm">কোনো ব্যানার নেই। নতুন ব্যানার যোগ করুন।</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-xl"
            >
              <div className="relative w-full sm:w-40 h-28 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.titleBn}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {item.subtitle || item.titleBn}
                  </h3>
                  {item.isMain && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      <Star className="w-3 h-3 fill-current" />
                      মেইন ব্যানার
                    </span>
                  )}
                  {!item.active && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      নিষ্ক্রিয়
                    </span>
                  )}
                </div>
                {item.subtitleBn && (
                  <p className="text-sm text-gray-600 line-clamp-2">{item.subtitleBn}</p>
                )}
                {item.link && (
                  <p className="text-xs text-gray-400 mt-1 truncate">{item.link}</p>
                )}
              </div>

              <div className="flex sm:flex-col gap-2 shrink-0">
                {!item.isMain && (
                  <button
                    type="button"
                    onClick={() => handleSetMain(item.id)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50"
                  >
                    <Star className="w-4 h-4" />
                    মেইন সেট
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Pencil className="w-4 h-4" />
                  সম্পাদনা
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  মুছুন
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AdminModal
          title={editingId ? "ব্যানার সম্পাদনা" : "নতুন ব্যানার"}
          onClose={() => setShowForm(false)}
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                বাতিল
              </button>
              <button
                type="submit"
                form="banner-form"
                disabled={saving}
                className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
              >
                {saving ? "সংরক্ষণ..." : "সংরক্ষণ করুন"}
              </button>
            </div>
          }
        >
          <form id="banner-form" onSubmit={handleSave} className="space-y-4">
            <ImageUploader
              label="ব্যানার ইমেজ"
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
            />
            <div>
              <label className="block text-sm font-medium mb-1">ছোট শিরোনাম</label>
              <input
                className="input-field"
                value={form.titleBn}
                onChange={(e) => setForm({ ...form, titleBn: e.target.value })}
                placeholder="উপরের ছোট লেখা"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">বড় শিরোনাম</label>
              <input
                className="input-field"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="মূল হেডলাইন"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">বিবরণ</label>
              <textarea
                className="input-field min-h-[80px]"
                value={form.subtitleBn}
                onChange={(e) => setForm({ ...form, subtitleBn: e.target.value })}
                placeholder="ব্যানারের নিচের বিবরণ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">লিংক (ঐচ্ছিক)</label>
              <input
                className="input-field"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="/category/pure-honey"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ইংরেজি শিরোনাম</label>
              <input
                className="input-field"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Home Banner"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              সক্রিয় ব্যানার
            </label>
            {!editingId && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isMain}
                  onChange={(e) => setForm({ ...form, isMain: e.target.checked })}
                />
                মেইন ব্যানার হিসেবে সেট করুন
              </label>
            )}
          </form>
        </AdminModal>
      )}
    </div>
  );
}
