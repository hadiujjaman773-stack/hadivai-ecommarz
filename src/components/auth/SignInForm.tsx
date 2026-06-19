"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "লগইন ব্যর্থ হয়েছে");
        return;
      }

      const role = data.user?.role;
      router.push(
        role === "SUPER_ADMIN" || role === "ADMIN"
          ? "/admin/dashboard"
          : "/"
      );
      router.refresh();
    } catch {
      setError("লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/80 backdrop-blur shadow-xl">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(27,67,50,0.08),transparent_45%),radial-gradient(ellipse_at_bottom_right,rgba(201,162,39,0.12),transparent_45%)]" />

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            লগইন
          </h2>
          <p className="text-center text-sm text-gray-600 mb-6">
            আপনার অ্যাকাউন্টে প্রবেশ করুন
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ইমেইল
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="admin@mosafamart.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 bg-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 my-1 px-3 rounded-md text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                  aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? "লুকান" : "দেখান"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                মনে রাখুন
              </label>
              <Link
                href="/admin/login"
                className="text-sm brand-text hover:underline"
              >
                অ্যাডমিন লগইন
              </Link>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 px-4 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "লগইন হচ্ছে..." : "লগইন"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            নতুন অ্যাকাউন্ট?{" "}
            <Link href="/signup" className="brand-text hover:underline">
              রেজিস্ট্রেশন
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
