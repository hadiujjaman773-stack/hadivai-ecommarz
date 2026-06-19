"use client";

import dynamic from "next/dynamic";

const FloatingButtons = dynamic(
  () =>
    import("@/components/layout/FloatingButtons").then((m) => m.FloatingButtons),
  { ssr: false }
);

const CartSidebar = dynamic(
  () => import("@/components/cart/CartSidebar").then((m) => m.CartSidebar),
  { ssr: false }
);

const PwaRegister = dynamic(
  () =>
    import("@/components/layout/PwaRegister").then((m) => ({
      default: m.PwaRegister,
    })),
  { ssr: false }
);

export function ShopDeferredWidgets() {
  return (
    <>
      <FloatingButtons />
      <CartSidebar />
      <PwaRegister />
    </>
  );
}
