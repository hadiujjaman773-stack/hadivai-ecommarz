"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, User, Heart, ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { SITE, NAV_CATEGORIES } from "@/data/seed-data";

export function Header() {
  const { totalItems, subtotal, openCart, hydrated } = useCart();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = () => {
    if (search.trim()) {
      router.push(
        `/category/kitchen-item?q=${encodeURIComponent(search.trim())}`
      );
    }
  };

  const cartButton = (
    <button
      type="button"
      onClick={openCart}
      className="relative flex items-center gap-2 text-gray-700 hover:text-[var(--primary-color)] transition-colors"
    >
      <div className="relative">
        <ShoppingCart className="w-6 h-6" />
        {hydrated && totalItems > 0 && (
          <span className="absolute -top-2 -right-2 brand-bg text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {totalItems}
          </span>
        )}
      </div>
      <div className="hidden sm:flex flex-col text-left">
        <span className="text-xs font-medium">আমার কার্ট</span>
        <span className="text-xs text-gray-500">
          {hydrated ? formatPrice(subtotal) : formatPrice(0)}
        </span>
      </div>
    </button>
  );

  return (
    <>
      {/* Mobile header row — original markup */}
      <div className="md:hidden bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Image
              src={SITE.logo}
              alt={SITE.name}
              width={72}
              height={72}
              className="object-contain h-14 w-14"
              priority
            />
          </Link>
          <div className="flex items-center gap-4">
            {cartButton}
            <button
              type="button"
              className="p-1 text-gray-700"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop header row — original markup */}
      <div className="hidden md:block bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-8">
            <div className="justify-self-start">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <Image
                  src={SITE.logo}
                  alt={SITE.name}
                  width={88}
                  height={88}
                  className="object-contain h-20 w-20"
                  priority
                />
              </Link>
            </div>

            <div className="justify-self-center w-full max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="পণ্য খুঁজুন..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-full outline-none focus:outline-none text-gray-700 placeholder-gray-400"
                />
                <button
                  type="button"
                  aria-label="Search"
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full brand-bg grid place-items-center shadow brand-ring brand-hover-bg"
                >
                  <Search className="w-4 h-4 text-current" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-x-6">
              <Link
                aria-label="Profile"
                href="/login"
                className="flex items-center text-gray-700 hover:text-[var(--primary-color)] transition-colors"
              >
                <User className="w-6 h-6" />
              </Link>
              <Link
                href="/wishlist"
                className="relative flex items-center text-gray-700 hover:text-[var(--primary-color)] transition-colors"
              >
                <Heart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 brand-bg text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  0
                </span>
              </Link>
              {cartButton}
            </div>
          </div>
        </div>
      </div>

      {/* Category nav — original markup */}
      <div className="md:block bg-white border-b-2 border-[var(--brand-green)]/15">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="relative z-30 hidden md:flex items-center py-4 justify-center">
            <div className="hidden md:flex items-center gap-x-8">
              <div className="relative group">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-[var(--primary-color)] font-medium transition-colors uppercase flex items-center gap-1"
                >
                  হোম
                </Link>
              </div>
              {NAV_CATEGORIES.map((cat) => (
                <div key={cat.slug} className="relative group">
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-gray-700 hover:text-[var(--primary-color)] font-medium transition-colors uppercase flex items-center gap-1"
                  >
                    {cat.nameBn}
                  </Link>
                </div>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden px-4 py-3 overflow-y-auto border-b border-gray-200 bg-white">
          <Link
            href="/"
            className="block py-2 text-gray-700 hover:text-[var(--primary-color)] uppercase font-medium"
            onClick={() => setMobileOpen(false)}
          >
            হোম
          </Link>
          {NAV_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="block py-2 text-gray-700 hover:text-[var(--primary-color)]"
              onClick={() => setMobileOpen(false)}
            >
              {cat.nameBn}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
