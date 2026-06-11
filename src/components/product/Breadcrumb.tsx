import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <section className="py-4" aria-label="Breadcrumb">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 flex-wrap">
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              return (
                <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="hover:text-violet-600 text-gray-600"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={
                        isLast
                          ? "text-gray-900 font-medium line-clamp-1"
                          : "text-gray-600"
                      }
                    >
                      {item.label}
                    </span>
                  )}
                  {!isLast && (
                    <ChevronRight
                      className="w-4 h-4 text-gray-400 flex-shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </section>
  );
}
