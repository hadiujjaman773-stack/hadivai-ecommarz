import type { ProductWithCategory } from "@/types";
import { ProductCard, RELATED_CARD_HEIGHTS } from "./ProductCard";

export function ProductGrid({
  products,
  title,
  subtitle,
  variant = "featured",
  bare = false,
}: {
  products: ProductWithCategory[];
  title?: string;
  subtitle?: string;
  variant?: "featured" | "popular" | "related";
  bare?: boolean;
}) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        কোনো পণ্য পাওয়া যায়নি
      </div>
    );
  }

  const heading = (
    <div className="text-center mb-12">
      {title && (
        <h2
          className={`text-3xl font-bold text-gray-900${subtitle ? " mb-4" : ""}`}
        >
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  );

  const isRelated = variant === "related";

  const grid = (
    <>
      {title && heading}
      <div
        className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6 w-full`}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            linked={isRelated}
            cardHeightsOverride={isRelated ? RELATED_CARD_HEIGHTS : undefined}
          />
        ))}
      </div>
    </>
  );

  if (bare) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">{grid}</div>
    );
  }

  const sectionClass =
    variant === "popular"
      ? "py-10 sm:py-16 lg:py-20 bg-white"
      : "py-6 md:py-12 lg:py-16 bg-white";

  return (
    <section className={sectionClass}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">{grid}</div>
    </section>
  );
}
