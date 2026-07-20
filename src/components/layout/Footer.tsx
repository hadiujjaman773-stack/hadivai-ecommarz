import Link from "next/link";
import Image from "next/image";
import type { CategoryItem } from "@/types";
import type { StoreSettings } from "@/lib/store-settings";

const iconClass = "w-5 h-5";

interface FooterProps {
  categories: CategoryItem[];
  settings: StoreSettings;
}

export function Footer({ categories, settings }: FooterProps) {
  const whatsappNumber = settings.whatsapp?.replace(/\D/g, "");

  return (
    <footer className="footer-brand text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="hover:opacity-80 transition-opacity inline-block">
              <Image
                src={settings.logo || "/logo.png"}
                alt={settings.siteName}
                width={120}
                height={120}
                className="object-contain h-24 w-auto"
              />
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              {settings.footerText}
            </p>
            <div className="flex space-x-4">
              {settings.facebook && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={settings.facebook}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass} aria-hidden="true">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">গুরুত্বপূর্ণ লিঙ্কসমূহ</h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-gray-300 text-sm hover:text-white transition-colors"
                  >
                    {cat.nameBn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">গ্রাহক সেবা</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/about-us" className="hover:text-white transition-colors">
                  আমাদের সম্পর্কে
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-white transition-colors">
                  যোগাযোগ করুন
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-white transition-colors">
                  আমার কার্ট
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">যোগাযোগ</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {settings.phone && (
                <li>
                  ফোন:{" "}
                  <a href={`tel:${settings.phone}`} className="hover:text-white">
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.whatsapp && (
                <li>
                  WhatsApp:{" "}
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    {settings.whatsapp}
                  </a>
                </li>
              )}
              {settings.email && (
                <li>
                  ইমেইল:{" "}
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-white break-all"
                  >
                    {settings.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} {settings.siteName}. সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>
    </footer>
  );
}
