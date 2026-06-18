import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { NotificationProvider } from "@/components/admin/NotificationProvider";
import { isInventoryEnabled } from "@/lib/feature-flags";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const inventoryEnabled = isInventoryEnabled();

  return (
    <NotificationProvider>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar
          userRole={session.role}
          inventoryEnabled={inventoryEnabled}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              স্বাগতম, <span className="font-semibold text-gray-900">{session.name}</span>
            </p>
            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
              {session.role === "SUPER_ADMIN" ? "সুপার অ্যাডমিন" : "অ্যাডমিন"}
            </span>
          </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </NotificationProvider>
  );
}
