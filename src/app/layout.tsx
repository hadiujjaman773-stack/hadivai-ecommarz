import type { Metadata, Viewport } from "next";
import { Baloo_Da_2 } from "next/font/google";
import "./globals.css";
import { SITE } from "@/data/seed-data";

const baloo = Baloo_Da_2({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  fallback: ["system-ui", "Arial"],
  adjustFontFallback: true,
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1b4332",
};

export const metadata: Metadata = {
  title: `${SITE.name} | ${SITE.tagline}`,
  description: SITE.description,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE.shortName,
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  formatDetection: {
    telephone: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" dir="ltr" className={baloo.className}>
      <body className="min-h-screen antialiased bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
