import Link from "next/link";
import Image from "next/image";
import type { CategoryItem } from "@/types";

export function CategoryGrid({ categories }: { categories: CategoryItem[] }) {
  return (
    <section className="bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ঘরের প্রতিটি প্রয়োজন, এক জায়গায়
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group relative overflow-hidden rounded-xl bg-gray-100 cursor-pointer hover:shadow-2xl transition-all duration-500"
            >
              <div className="w-full h-[300px] md:h-[400px] overflow-hidden relative">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.nameBn}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                  <h3 className="text-white font-bold text-lg mb-1 transition-colors">
                    {cat.nameBn}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
