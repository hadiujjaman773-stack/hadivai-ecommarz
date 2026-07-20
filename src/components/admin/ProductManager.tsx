"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "./PageHeader";
import { AdminModal } from "./AdminModal";
import { SearchFilterBar } from "./SearchFilterBar";
import { ImageUploader } from "./ImageUploader";
import { useNotification } from "./NotificationProvider";
import { Pagination } from "./Pagination";
import { isPaginatedResponse } from "@/lib/admin-list";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { slugify } from "@/lib/slug";
import {
  DEFAULT_PRODUCT_UNIT,
  PRODUCT_UNITS,
  getUnitLabel,
} from "@/lib/product-units";
import { getProductPath } from "@/lib/product-url";
import { newVariantId, parseVariants } from "@/lib/product-variants";
import { getTotalStock } from "@/lib/inventory";
import type { ProductVariant } from "@/types";

interface Category {
  id: string;
  nameBn: string;
}

interface Product {
  id: string;
  title: string;
  titleBn: string;
  slug: string;
  price: number;
  inStock: boolean;
  featured: boolean;
  shippingFree: boolean;
  unit?: string;
  stock?: number;
  category: { nameBn: string; slug: string };
}

const emptyForm = {
  title: "",
  titleBn: "",
  slug: "",
  description: "",
  descriptionBn: "",
  price: "",
  comparePrice: "",
  images: [] as string[],
  variants: [] as ProductVariant[],
  unit: DEFAULT_PRODUCT_UNIT as string,
  categoryId: "",
  shippingFree: false,
  featured: false,
  stock: "0",
};

export function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("");
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
    if (stockFilter) params.set("inStock", stockFilter);
    params.set("page", String(page));

    const [prodRes, catRes] = await Promise.all([
      fetch(`/api/admin/products?${params}`),
      fetch("/api/admin/categories?all=true"),
    ]);
    const prodData = await prodRes.json();
    if (isPaginatedResponse<Product>(prodData)) {
      setProducts(prodData.items);
      setTotal(prodData.total);
      setTotalPages(prodData.totalPages);
      setPageSize(prodData.pageSize);
    } else {
      setProducts(prodData);
    }
    const catData = await catRes.json();
    setCategories(Array.isArray(catData) ? catData : catData.items ?? []);
    setLoading(false);
  }, [search, stockFilter, page]);

  useEffect(() => {
    setPage(1);
  }, [search, stockFilter]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = async (id: string) => {
    const res = await fetch(`/api/admin/products/${id}`);
    const p = await res.json();
    setEditingId(id);
    setForm({
      title: p.title,
      titleBn: p.titleBn,
      slug: p.slug,
      description: p.description || "",
      descriptionBn: p.descriptionBn || "",
      price: String(p.price),
      comparePrice: p.comparePrice ? String(p.comparePrice) : "",
      images: p.images,
      variants: parseVariants(p.variants),
      unit: p.unit || DEFAULT_PRODUCT_UNIT,
      categoryId: p.categoryId,
      shippingFree: p.shippingFree,
      featured: p.featured,
      stock: String(p.stock ?? 0),
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title: form.title,
      titleBn: form.titleBn,
      slug: form.slug || slugify(form.titleBn || form.title),
      description: form.description,
      descriptionBn: form.descriptionBn,
      price: Number(form.price),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
      images: form.images,
      variants: form.variants,
      unit: form.unit,
      categoryId: form.categoryId,
      shippingFree: form.shippingFree,
      featured: form.featured,
      stock: Number(form.stock) || 0,
    };

    const url = editingId
      ? `/api/admin/products/${editingId}`
      : "/api/admin/products";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      notifyError("সংরক্ষণ ব্যর্থ", data.error);
      setSaving(false);
      return;
    }

    success(editingId ? "পণ্য আপডেট হয়েছে" : "পণ্য তৈরি হয়েছে");
    setShowForm(false);
    setSaving(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই পণ্য মুছে ফেলবেন?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      notifyError("মুছা ব্যর্থ", data.error);
      return;
    }
    success("পণ্য মুছে ফেলা হয়েছে");
    load();
  };

  return (
    <div>
      <PageHeader
        title="পণ্য ব্যবস্থাপনা"
        description="পণ্য তৈরি, সম্পাদনা ও মুছুন"
        action={
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-2">
            <Plus className="w-4 h-4" />
            নতুন পণ্য
          </button>
        }
      />

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="পণ্য খুঁজুন..."
      >
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
        >
          <option value="">সব স্টক</option>
          <option value="true">স্টকে আছে</option>
          <option value="false">স্টক শেষ</option>
        </select>
      </SearchFilterBar>

      {showForm && (
        <AdminModal
          title={editingId ? "পণ্য সম্পাদনা" : "নতুন পণ্য"}
          onClose={() => setShowForm(false)}
        >
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">শিরোনাম (EN)</label>
                  <input
                    className="input-field"
                    value={form.title}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        title: e.target.value,
                        slug: editingId ? form.slug : slugify(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">শিরোনাম (বাংলা)</label>
                  <input
                    className="input-field"
                    value={form.titleBn}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        titleBn: e.target.value,
                        slug: editingId ? form.slug : slugify(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    স্লাগ (ঐচ্ছিক)
                  </label>
                  <input
                    className="input-field"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="খালি থাকলে শিরোনাম থেকে তৈরি হবে"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ক্যাটাগরি</label>
                  <select
                    className="input-field"
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    required
                  >
                    <option value="">নির্বাচন করুন</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameBn}
                      </option>
                    ))}
                  </select>
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
                <div>
                  <label className="block text-sm font-medium mb-1">তুলনামূলক মূল্য</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.comparePrice}
                    onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
                  />
                </div>
              </div>

              <ImageUploader
                label="মূল ইমেজ (একাধিক)"
                multiple
                value={form.images}
                onChange={(urls) => setForm({ ...form, images: urls })}
              />

              <div>
                <label className="block text-sm font-medium mb-1">ইউনিট</label>
                <select
                  className="input-field"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                >
                  {PRODUCT_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label} ({u.labelEn})
                    </option>
                  ))}
                </select>
              </div>

              {form.variants.length === 0 ? (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    স্টক ({getUnitLabel(form.unit)})
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="input-field"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  />
                </div>
              ) : (
                <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-sm text-blue-800">
                  মোট স্টক (ভ্যারিয়েন্ট যোগফল):{" "}
                  <strong>
                    {getTotalStock(Number(form.stock) || 0, form.variants)}{" "}
                    {getUnitLabel(form.unit)}
                  </strong>
                </div>
              )}

              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">ভ্যারিয়েন্ট</p>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        variants: [
                          ...form.variants,
                          {
                            id: newVariantId(),
                            nameBn: "",
                            price: Number(form.price) || 0,
                            comparePrice: null,
                            image: null,
                            stock: 0,
                            inStock: true,
                          },
                        ],
                      })
                    }
                    className="text-sm text-[var(--accent-color)] flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> যোগ করুন
                  </button>
                </div>
                {form.variants.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    ভ্যারিয়েন্ট না থাকলে মূল মূল্য ব্যবহার হবে
                  </p>
                ) : (
                  <div className="space-y-3">
                    {form.variants.map((variant, index) => (
                      <div
                        key={variant.id}
                        className="bg-white border border-gray-200 rounded-lg p-3 space-y-2"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input
                            className="input-field"
                            placeholder="ভ্যারিয়েন্ট নাম (যেমন: ৯ ইঞ্চি)"
                            value={variant.nameBn}
                            onChange={(e) => {
                              const variants = [...form.variants];
                              variants[index] = {
                                ...variants[index],
                                nameBn: e.target.value,
                              };
                              setForm({ ...form, variants });
                            }}
                            required
                          />
                          <input
                            type="number"
                            className="input-field"
                            placeholder="মূল্য"
                            value={variant.price || ""}
                            onChange={(e) => {
                              const variants = [...form.variants];
                              variants[index] = {
                                ...variants[index],
                                price: Number(e.target.value),
                              };
                              setForm({ ...form, variants });
                            }}
                            required
                          />
                        </div>
                        <ImageUploader
                          label="ভ্যারিয়েন্ট ইমেজ (ঐচ্ছিক)"
                          value={variant.image || ""}
                          onChange={(url) => {
                            const variants = [...form.variants];
                            variants[index] = { ...variants[index], image: url };
                            setForm({ ...form, variants });
                          }}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input
                            type="number"
                            min={0}
                            className="input-field"
                            placeholder={`স্টক (${getUnitLabel(form.unit)})`}
                            value={variant.stock ?? 0}
                            onChange={(e) => {
                              const variants = [...form.variants];
                              const stock = Math.max(0, Number(e.target.value) || 0);
                              variants[index] = {
                                ...variants[index],
                                stock,
                                inStock: stock > 0,
                              };
                              setForm({ ...form, variants });
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              setForm({
                                ...form,
                                variants: form.variants.filter(
                                  (_, i) => i !== index
                                ),
                              })
                            }
                            className="text-red-500 text-sm"
                          >
                            মুছুন
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!form.shippingFree}
                    onChange={(e) =>
                      setForm({ ...form, shippingFree: !e.target.checked })
                    }
                  />
                  <span className="text-sm">শিপিং চার্জ প্রযোজ্য (আনটিক = ফ্রি শিপিং)</span>
                </label>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  />
                  <span className="text-sm">ফিচার্ড</span>
                </label>
              </div>
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
        ) : products.length === 0 ? (
          <p className="p-8 text-center text-gray-500">কোনো পণ্য নেই</p>
        ) : (
          <>
            {/* Mobile: stacked cards — no horizontal scroll */}
            <div className="md:hidden divide-y divide-gray-100">
              {products.map((p) => (
                <div key={p.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 break-words">
                        {p.titleBn}
                      </div>
                      <Link
                        href={getProductPath({
                          slug: p.slug,
                          category: p.category,
                        })}
                        target="_blank"
                        className="text-xs text-[var(--accent-color)] hover:underline"
                      >
                        দেখুন
                      </Link>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEdit(p.id)}
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-[var(--accent-color)]"
                        aria-label="সম্পাদনা"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="p-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-500"
                        aria-label="মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="text-xs text-gray-400 block">ক্যাটাগরি</span>
                      {p.category.nameBn}
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">মূল্য</span>
                      {formatPrice(p.price)}
                      <span className="text-xs text-gray-500">
                        {" "}
                        / {getUnitLabel(p.unit)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">স্টক</span>
                      {p.stock ?? 0} {getUnitLabel(p.unit)}
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">শিপিং</span>
                      {p.shippingFree ? (
                        <span className="text-green-600">ফ্রি</span>
                      ) : (
                        <span>চার্জ</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-5 py-3">পণ্য</th>
                    <th className="text-left px-5 py-3">ক্যাটাগরি</th>
                    <th className="text-left px-5 py-3">মূল্য / ইউনিট</th>
                    <th className="text-left px-5 py-3">স্টক</th>
                    <th className="text-left px-5 py-3">শিপিং</th>
                    <th className="text-right px-5 py-3">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="font-medium">{p.titleBn}</div>
                        <Link
                          href={getProductPath({
                            slug: p.slug,
                            category: p.category,
                          })}
                          target="_blank"
                          className="text-xs text-[var(--accent-color)] hover:underline"
                        >
                          দেখুন
                        </Link>
                      </td>
                      <td className="px-5 py-3">{p.category.nameBn}</td>
                      <td className="px-5 py-3 font-medium">
                        {formatPrice(p.price)}
                        <span className="text-xs text-gray-500 block">
                          / {getUnitLabel(p.unit)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-medium">{p.stock ?? 0}</span>
                        <span className="text-xs text-gray-500 block">
                          {getUnitLabel(p.unit)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {p.shippingFree ? (
                          <span className="text-green-600 text-xs">ফ্রি</span>
                        ) : (
                          <span className="text-xs text-gray-600">চার্জ</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openEdit(p.id)}
                          className="p-1.5 text-gray-500 hover:text-[var(--accent-color)] inline-flex"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-gray-500 hover:text-red-500 inline-flex ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
