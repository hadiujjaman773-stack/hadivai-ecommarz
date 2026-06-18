import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NotificationProvider } from "@/components/admin/NotificationProvider";
import { AdminShell } from "@/components/admin/AdminShell";
import { isInventoryEnabled } from "@/lib/feature-flags";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <NotificationProvider>
      <AdminShell
        userRole={session.role}
        userName={session.name}
        inventoryEnabled={isInventoryEnabled()}
      >
        {children}
      </AdminShell>
    </NotificationProvider>
  );
}
