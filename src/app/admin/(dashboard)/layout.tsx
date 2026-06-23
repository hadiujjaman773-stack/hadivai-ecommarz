import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NotificationProvider } from "@/components/admin/NotificationProvider";
import { AdminShell } from "@/components/admin/AdminShell";
import { isInventoryEnabled } from "@/lib/feature-flags";
import {
  ADMIN_NAV_ITEMS,
  filterAdminNavItems,
} from "@/lib/admin-nav";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const navLinks = filterAdminNavItems(
    ADMIN_NAV_ITEMS,
    session.role,
    isInventoryEnabled()
  );

  return (
    <NotificationProvider>
      <AdminShell
        userRole={session.role}
        userName={session.name}
        navLinks={navLinks}
      >
        {children}
      </AdminShell>
    </NotificationProvider>
  );
}
