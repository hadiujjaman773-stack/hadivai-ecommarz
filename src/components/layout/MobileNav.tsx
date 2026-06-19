"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_CATEGORIES } from "@/data/seed-data";
import { HeaderCartButton } from "./HeaderClient";

export function MobileNavToggle() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="p-1 text-gray-700 md:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
      {open && (
        <nav className="md:hidden absolute left-0 right-0 top-full z-40 px-4 py-3 border-b border-gray-200 bg-white shadow-sm">
          <Link
            href="/"
            prefetch
            className="block py-2 text-gray-700 hover:text-[var(--primary-color)] uppercase font-medium"
            onClick={() => setOpen(false)}
          >
            হোম
          </Link>
          {NAV_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              prefetch
              className="block py-2 text-gray-700 hover:text-[var(--primary-color)]"
              onClick={() => setOpen(false)}
            >
              {cat.nameBn}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}

export function MobileHeaderActions() {
  return (
    <div className="flex items-center gap-4 md:hidden">
      <HeaderCartButton compact />
      <MobileNavToggle />
    </div>
  );
}
