import Link from "next/link";
import { SITE } from "@/data/seed-data";

export function TopBar() {
  return (
    <div className="topbar py-3 hidden md:block">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left mb-2 sm:mb-0">
            <span className="text-xs sm:text-sm font-medium">
              {SITE.description}{" "}
            </span>
          </div>
          <div className="flex items-center justify-center sm:justify-end space-x-2 sm:space-x-4">
            <Link
              href="/about-us"
              className="text-xs sm:text-sm brand-hover-text transition-colors"
            >
              আমাদের সম্পর্কে
            </Link>
            <span className="text-gray-400 hidden sm:inline">|</span>
            <Link
              href="/contact-us"
              className="text-xs sm:text-sm brand-hover-text transition-colors"
            >
              যোগাযোগ করুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
