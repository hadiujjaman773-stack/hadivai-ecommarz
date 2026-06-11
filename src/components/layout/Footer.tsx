import Link from "next/link";
import Image from "next/image";
import { SITE, NAV_CATEGORIES } from "@/data/seed-data";

const iconClass = "w-5 h-5";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="hover:opacity-80 transition-opacity inline-block">
              <Image
                src={SITE.logo}
                alt="Mosafamart"
                width={150}
                height={40}
                className="object-contain"
              />
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              {SITE.footerText}
            </p>
            <div className="flex space-x-4">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://facebook.com"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow facebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass} aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://instagram.com"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass} aria-hidden="true">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://youtube.com"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow youtube"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass} aria-hidden="true">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                  <path d="m10 15 5-3-5-3z" />
                </svg>
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://twitter.com"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow twitter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass} aria-hidden="true">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">গুরুত্বপূর্ণ লিঙ্কসমূহ</h3>
            <ul className="space-y-2">
              {NAV_CATEGORIES.slice(0, 6).map((cat) => (
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
              <li>ফোন: {SITE.phone}</li>
              <li>WhatsApp: {SITE.whatsapp}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} {SITE.name}. সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>
    </footer>
  );
}
