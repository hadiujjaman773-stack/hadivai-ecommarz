"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import type { AdminNavItem } from "@/lib/admin-nav";

interface AdminShellProps {
  userRole: string;
  userName: string;
  navLinks: AdminNavItem[];
  children: React.ReactNode;
}

export function AdminShell({
  userRole,
  userName,
  navLinks,
  children,
}: AdminShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="মেনু বন্ধ"
          onClick={() => setOpen(false)}
        />
      )}

      <AdminSidebar
        navLinks={navLinks}
        mobileOpen={open}
        onClose={() => setOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 w-full">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-gray-100"
              aria-label="মেনু"
              onClick={() => setOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <p className="text-sm text-gray-600 truncate">
              স্বাগতম,{" "}
              <span className="font-semibold text-gray-900">{userName}</span>
            </p>
          </div>
          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 shrink-0">
            {userRole === "SUPER_ADMIN" ? "সুপার অ্যাডমিন" : "অ্যাডমিন"}
          </span>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
