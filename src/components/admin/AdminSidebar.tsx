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
}

export function AdminSidebar({
  userRole,
  inventoryEnabled = true,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <aside className="w-64 footer-brand text-white min-h-screen flex flex-col shrink-0">
      <div className="p-5 border-b border-white/10">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <Image
            src={SITE.logo}
            alt={SITE.name}
            width={48}
            height={48}
            className="h-12 w-12 object-contain"
          />
          <div>
            <p className="text-sm font-bold text-[var(--accent-color)] leading-tight">
              Admin Panel
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{SITE.name}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems
          .filter(
            (item) =>
              (!item.superAdminOnly || userRole === "SUPER_ADMIN") &&
              (!("inventoryOnly" in item && item.inventoryOnly) || inventoryEnabled)
          )
          .map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-[var(--accent-color)] text-[var(--brand-green-dark)] font-semibold"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
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
