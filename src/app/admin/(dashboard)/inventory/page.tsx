import { redirect } from "next/navigation";
import { InventoryManager } from "@/components/admin/InventoryManager";
import { isInventoryEnabled } from "@/lib/feature-flags";

export const metadata = { title: "ইনভেন্টরি" };

export default function InventoryPage() {
  if (!isInventoryEnabled()) {
    redirect("/admin/dashboard");
  }

  return <InventoryManager />;
}
