import { CartProvider } from "@/lib/cart-context";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ShopDeferredWidgets } from "@/components/layout/ShopDeferredWidgets";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <ShopDeferredWidgets />
    </CartProvider>
  );
}
