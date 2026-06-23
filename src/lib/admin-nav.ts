export type AdminNavIcon =
  | "layout-dashboard"
  | "folder-tree"
  | "package"
  | "warehouse"
  | "shopping-cart"
  | "send"
  | "truck"
  | "users"
  | "settings";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: AdminNavIcon;
  superAdminOnly?: boolean;
  inventoryOnly?: boolean;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    href: "/admin/dashboard",
    label: "ড্যাশবোর্ড",
    icon: "layout-dashboard",
  },
  {
    href: "/admin/categories",
    label: "ক্যাটাগরি",
    icon: "folder-tree",
  },
  { href: "/admin/products", label: "পণ্য", icon: "package" },
  {
    href: "/admin/inventory",
    label: "ইনভেন্টরি",
    icon: "warehouse",
    inventoryOnly: true,
  },
  { href: "/admin/orders", label: "অর্ডার", icon: "shopping-cart" },
  { href: "/admin/steadfast", label: "Steadfast", icon: "send" },
  { href: "/admin/shipping", label: "শিপিং", icon: "truck" },
  {
    href: "/admin/users",
    label: "ইউজার",
    icon: "users",
    superAdminOnly: true,
  },
  { href: "/admin/settings", label: "সেটিংস", icon: "settings" },
];

export function filterAdminNavItems(
  items: AdminNavItem[],
  userRole: string,
  inventoryEnabled: boolean
): AdminNavItem[] {
  return items.filter(
    (item) =>
      (!item.superAdminOnly || userRole === "SUPER_ADMIN") &&
      (!item.inventoryOnly || inventoryEnabled)
  );
}
