"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderTree,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Settings,
  LogOut,
  Warehouse,
  X,
} from "lucide-react";
import { SITE } from "@/data/seed-data";

const navItems = [
  { href: "/admin/dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { href: "/admin/categories", label: "ক্যাটাগরি", icon: FolderTree },
  { href: "/admin/products", label: "পণ্য", icon: Package },
  {
    href: "/admin/inventory",
    label: "ইনভেন্টরি",
    icon: Warehouse,
    inventoryOnly: true,
  },
  { href: "/admin/orders", label: "অর্ডার", icon: ShoppingCart },
  { href: "/admin/shipping", label: "শিপিং", icon: Truck },
  { href: "/admin/users", label: "ইউজার", icon: Users, superAdminOnly: true },
  { href: "/admin/settings", label: "সেটিংস", icon: Settings },
];

interface AdminSidebarProps {
  userRole: string;
  inventoryEnabled?: boolean;
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({
  userRole,
  inventoryEnabled = true,
  mobileOpen = false,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const links = navItems.filter(
    (item) =>
      (!item.superAdminOnly || userRole === "SUPER_ADMIN") &&
      (!("inventoryOnly" in item && item.inventoryOnly) || inventoryEnabled)
  );

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 w-64 footer-brand text-white min-h-screen flex flex-col shrink-0 transform transition-transform duration-200 ease-out lg:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-4 sm:p-5 border-b border-white/10 flex items-start justify-between gap-2">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3 min-w-0"
          onClick={onClose}
        >
          <Image
            src={SITE.logo}
            alt={SITE.name}
            width={44}
            height={44}
            className="h-11 w-11 object-contain shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--accent-color)] leading-tight truncate">
              Admin Panel
            </p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{SITE.name}</p>
          </div>
        </Link>
        <button
          type="button"
          className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 shrink-0"
          aria-label="বন্ধ"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-[var(--accent-color)] text-[var(--brand-green-dark)] font-semibold"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white mb-1"
        >
          সাইট দেখুন →
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-red-400 hover:bg-white/10 hover:text-red-300"
        >
          <LogOut className="w-5 h-5" />
          লগআউট
        </button>
      </div>
    </aside>
  );
}
