import type { Metadata } from "next";
import { Baloo_Da_2 } from "next/font/google";
import "./globals.css";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingButtons } from "@/components/layout/FloatingButtons";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { CartProvider } from "@/lib/cart-context";
import { SITE } from "@/data/seed-data";

const baloo = Baloo_Da_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  fallback: ["Arial"],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: `${SITE.name} | ${SITE.tagline}`,
  description: SITE.description,
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" dir="ltr" className={baloo.className}>
      <body className="min-h-screen flex flex-col antialiased bg-white text-gray-900">
        <CartProvider>
          <TopBar />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingButtons />
          <CartSidebar />
        </CartProvider>
      </body>
    </html>
  );
}
