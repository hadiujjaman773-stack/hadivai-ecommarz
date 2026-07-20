import { CartProvider } from "@/lib/cart-context";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ShopDeferredWidgets } from "@/components/layout/ShopDeferredWidgets";
import { getCategories } from "@/lib/data";
import { getStoreSettings } from "@/lib/store-settings";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getStoreSettings(),
  ]);

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <Header categories={categories} />
        <main className="flex-1">{children}</main>
        <Footer categories={categories} settings={settings} />
      </div>
      <ShopDeferredWidgets
        phone={settings.phone}
        whatsapp={settings.whatsapp}
      />
    </CartProvider>
  );
}
