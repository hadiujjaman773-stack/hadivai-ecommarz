import { Suspense } from "react";
import { OrderManager } from "@/components/admin/OrderManager";

export const metadata = { title: "অর্ডার" };

export default function OrdersPage() {
  return (
    <Suspense fallback={<p className="text-gray-500">লোড হচ্ছে...</p>}>
      <OrderManager />
    </Suspense>
  );
}
