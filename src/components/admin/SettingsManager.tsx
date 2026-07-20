"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "./PageHeader";
import { ImageUploader } from "./ImageUploader";
import { BannerManager } from "./BannerManager";
import { useNotification } from "./NotificationProvider";

interface Settings {
  siteName: string;
  tagline: string | null;
  description: string | null;
  footerText: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  facebook: string | null;
  messenger: string | null;
  logo: string | null;
  shippingInsideDhaka: number;
  shippingOutsideDhaka: number;
}

export function SettingsManager() {
  const [form, setForm] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success, error } = useNotification();

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setForm(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);

    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      success("সেটিংস সংরক্ষিত হয়েছে");
    } else {
      error("সংরক্ষণ ব্যর্থ");
    }
    setSaving(false);
  };

  if (loading || !form) {
    return <p className="text-gray-500">লোড হচ্ছে...</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="সেটিংস"
        description="সাইটের সাধারণ তথ্য ও কনফিগারেশন"
      />

      <BannerManager />

      <form
        onSubmit={handleSave}
        className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">সাইটের নাম</label>
          <input
            className="input-field"
            value={form.siteName}
            onChange={(e) => setForm({ ...form, siteName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ট্যাগলাইন</label>
          <input
            className="input-field"
            value={form.tagline || ""}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">বিবরণ</label>
          <textarea
            className="input-field min-h-[80px]"
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ফুটার টেক্সট</label>
          <textarea
            className="input-field min-h-[80px]"
            value={form.footerText || ""}
            onChange={(e) => setForm({ ...form, footerText: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">ফোন</label>
            <input
              className="input-field"
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp</label>
            <input
              className="input-field"
              value={form.whatsapp || ""}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ইমেইল</label>
          <input
            type="email"
            className="input-field"
            value={form.email || ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Facebook URL</label>
          <input
            type="url"
            className="input-field"
            placeholder="https://facebook.com/your-page"
            value={form.facebook || ""}
            onChange={(e) => setForm({ ...form, facebook: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Messenger URL</label>
          <input
            className="input-field"
            value={form.messenger || ""}
            onChange={(e) => setForm({ ...form, messenger: e.target.value })}
          />
        </div>
        <ImageUploader
          label="লোগো"
          value={form.logo || ""}
          onChange={(url) => setForm({ ...form, logo: url })}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              ঢাকার ভেতরে শিপিং (৳)
            </label>
            <input
              type="number"
              className="input-field"
              value={form.shippingInsideDhaka}
              onChange={(e) =>
                setForm({
                  ...form,
                  shippingInsideDhaka: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              ঢাকার বাহিরে শিপিং (৳)
            </label>
            <input
              type="number"
              className="input-field"
              value={form.shippingOutsideDhaka}
              onChange={(e) =>
                setForm({
                  ...form,
                  shippingOutsideDhaka: Number(e.target.value),
                })
              }
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary px-6 py-2 disabled:opacity-60"
        >
          {saving ? "সংরক্ষণ..." : "সংরক্ষণ করুন"}
        </button>
      </form>
    </div>
  );
}
