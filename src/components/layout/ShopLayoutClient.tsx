"use client";

import dynamic from "next/dynamic";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/lib/cart-context";
import { PwaRegister } from "@/components/layout/PwaRegister";

const FloatingButtons = dynamic(
  () =>
    import("@/components/layout/FloatingButtons").then((m) => m.FloatingButtons),
  { ssr: false }
);

const CartSidebar = dynamic(
  () => import("@/components/cart/CartSidebar").then((m) => m.CartSidebar),
  { ssr: false }
);

export function ShopLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <FloatingButtons />
      <CartSidebar />
      <PwaRegister />
    </CartProvider>
  );
}
