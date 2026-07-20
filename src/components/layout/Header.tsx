import Link from "next/link";
import Image from "next/image";
import { User, Heart } from "lucide-react";
import { SITE } from "@/data/seed-data";
import type { CategoryItem } from "@/types";
import { HeaderCartButton, HeaderSearch } from "./HeaderClient";
import { MobileHeaderActions } from "./MobileNav";

interface HeaderProps {
  categories: CategoryItem[];
}

export function Header({ categories }: HeaderProps) {
  const defaultCategorySlug = categories[0]?.slug || "pure-honey";

  return (
    <header className="bg-white relative z-20">
      {/* Mobile */}
      <div className="md:hidden border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" prefetch className="hover:opacity-80">
            <Image
              src={SITE.logo}
              alt={SITE.name}
              width={56}
              height={56}
              className="object-contain h-14 w-14"
              priority
            />
          </Link>
          <MobileHeaderActions categories={categories} />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-8">
            <Link href="/" prefetch className="hover:opacity-80">
              <Image
                src={SITE.logo}
                alt={SITE.name}
                width={80}
                height={80}
                className="object-contain h-20 w-20"
                priority
              />
            </Link>
            <div className="justify-self-center w-full">
              <HeaderSearch defaultCategorySlug={defaultCategorySlug} />
            </div>
            <div className="flex items-center justify-end gap-x-6">
              <Link
                aria-label="Profile"
                href="/login"
                prefetch
                className="text-gray-700 hover:text-[var(--primary-color)]"
              >
                <User className="w-6 h-6" />
              </Link>
              <Link
                href="/wishlist"
                prefetch
                className="relative text-gray-700 hover:text-[var(--primary-color)]"
              >
                <Heart className="w-6 h-6" />
              </Link>
              <HeaderCartButton />
            </div>
          </div>
        </div>
      </div>

      {/* Category nav — server rendered, instant prefetch */}
      <div className="hidden md:block border-b-2 border-[var(--brand-green)]/15">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center gap-x-8 py-3 overflow-x-auto">
            <Link
              href="/"
              prefetch
              className="text-gray-700 hover:text-[var(--primary-color)] font-medium whitespace-nowrap"
            >
              হোম
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                prefetch
                className="text-gray-700 hover:text-[var(--primary-color)] font-medium whitespace-nowrap"
              >
                {cat.nameBn}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
