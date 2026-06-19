"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";

export function HeaderCartButton({ compact = false }: { compact?: boolean }) {
  const { totalItems, subtotal, openCart, hydrated } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      className="relative flex items-center gap-2 text-gray-700 hover:text-[var(--primary-color)] transition-colors"
      aria-label="কার্ট খুলুন"
    >
      <div className="relative">
        <ShoppingCart className="w-6 h-6" />
        {hydrated && totalItems > 0 && (
          <span className="absolute -top-2 -right-2 brand-bg text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {totalItems}
          </span>
        )}
      </div>
      {!compact && (
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-medium">আমার কার্ট</span>
          <span className="text-xs text-gray-500">
            {hydrated ? formatPrice(subtotal) : formatPrice(0)}
          </span>
        </div>
      )}
    </button>
  );
}

export function HeaderSearch() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    if (search.trim()) {
      router.push(
        `/category/kitchen-item?q=${encodeURIComponent(search.trim())}`
      );
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <input
        type="search"
        placeholder="পণ্য খুঁজুন..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-full outline-none text-gray-700 placeholder-gray-400"
      />
      <button
        type="button"
        aria-label="Search"
        onClick={handleSearch}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full brand-bg grid place-items-center shadow"
      >
        <Search className="w-4 h-4 text-current" />
      </button>
    </div>
  );
}
