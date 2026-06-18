import Link from "next/link";
import Image from "next/image";
import { BadgePercent } from "lucide-react";
import type { ProductWithCategory } from "@/types";
import { formatPrice, formatPriceWithUnit, calcDiscount } from "@/lib/format";
import { getProductPath } from "@/lib/product-url";
import { ProductCardActions } from "./ProductCardActions";

const DEFAULT_CARD_HEIGHTS = {
  "--card-h": "220px",
  "--card-h-sm": "200px",
  "--card-h-lg": "280px",
} as React.CSSProperties;

export const RELATED_CARD_HEIGHTS = {
  "--card-h": "200px",
  "--card-h-sm": "180px",
  "--card-h-lg": "200px",
} as React.CSSProperties;

export function ProductCard({
  product,
  linked = false,
  cardHeightsOverride,
}: {
  product: ProductWithCategory;
  linked?: boolean;
  cardHeightsOverride?: React.CSSProperties;
}) {
  const firstVariant = product.variants[0];
  const activePrice = firstVariant?.price ?? product.price;
  const activeCompare = firstVariant?.comparePrice ?? product.comparePrice;
  const discount =
    product.discount ?? calcDiscount(activePrice, activeCompare);
  const productHref = getProductPath(product);
  const cardHeights = cardHeightsOverride ?? DEFAULT_CARD_HEIGHTS;
  const imageSrc = firstVariant?.image || product.images[0];

  const imageBlock = (
    <div
      className="relative overflow-hidden rounded-t-lg bg-gray-100 w-full h-[var(--card-h)] sm:h-[var(--card-h-sm)] lg:h-[var(--card-h-lg)]"
      style={cardHeights}
    >
      {imageSrc && (
        <Image
          src={imageSrc}
          alt={product.titleBn}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
        />
      )}
      {discount > 0 && (
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          <BadgePercent className="w-3 h-3" aria-hidden="true" />
          {discount}%
        </span>
      )}
    </div>
  );

  const priceBlock = (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
      <span className="text-base sm:text-lg font-bold text-gray-900">
        {formatPriceWithUnit(activePrice, product.unit)}
      </span>
      {activeCompare && activeCompare > activePrice && (
        <span className="text-xs sm:text-sm text-gray-400 line-through">
          {formatPrice(activeCompare)}
        </span>
      )}
    </div>
  );

  if (linked) {
    return (
      <Link
        href={productHref}
        className="group bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md block h-full"
      >
        {imageBlock}
        <div className="p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[2.25rem]">
            {product.titleBn}
          </h3>
          {priceBlock}
          <ProductCardActions
            product={product}
            firstVariant={firstVariant}
            activePrice={activePrice}
            activeCompare={activeCompare}
          />
        </div>
      </Link>
    );
  }

  return (
    <article className="product-card-shell bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
      <Link href={productHref} className="block">
        {imageBlock}
      </Link>
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <Link href={productHref}>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[2.25rem] hover:text-[var(--accent-color)]">
            {product.titleBn}
          </h3>
        </Link>
        {priceBlock}
        <div className="mt-auto pt-2">
          <ProductCardActions
            product={product}
            firstVariant={firstVariant}
            activePrice={activePrice}
            activeCompare={activeCompare}
            compact
          />
        </div>
      </div>
    </article>
  );
}
