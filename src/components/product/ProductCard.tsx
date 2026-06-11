"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingBag, Heart, BadgePercent } from "lucide-react";
import type { ProductWithCategory } from "@/types";
import { formatPrice, calcDiscount } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { SITE } from "@/data/seed-data";

const DEFAULT_CARD_HEIGHTS = {
  "--card-h": "385px",
  "--card-h-sm": "300px",
  "--card-h-lg": "400px",
} as React.CSSProperties;

const RELATED_CARD_HEIGHTS = {
  "--card-h": "385px",
  "--card-h-sm": "300px",
  "--card-h-lg": "300px",
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
  const { addItem, openCart } = useCart();
  const router = useRouter();
  const discount =
    product.discount ?? calcDiscount(product.price, product.comparePrice);

  const cardHeights = cardHeightsOverride ?? DEFAULT_CARD_HEIGHTS;

  const cartPayload = {
    productId: product.id,
    slug: product.slug,
    titleBn: product.titleBn,
    price: product.price,
    comparePrice: product.comparePrice ?? undefined,
    image: product.images[0] ?? "",
    ...(product.sizes[0] ? { size: product.sizes[0] } : {}),
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(cartPayload);
    openCart();
  };

  const handleOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(cartPayload);
    router.push("/checkout");
  };

  const disabled = !product.inStock;

  const imageBlock = (
    <div
      className="relative overflow-hidden rounded-t-lg bg-gray-100 w-full h-[var(--card-h)] sm:h-[var(--card-h-sm)] lg:h-[var(--card-h-lg)] mb-4"
      style={cardHeights}
    >
      <button
        type="button"
        aria-label="Add to wishlist"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="absolute top-3 left-3 z-20 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Heart className="text-gray-700 w-5 h-5" />
      </button>
      <Image
        src={product.images[0] ?? SITE.logo}
        alt={product.titleBn}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-300"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      />
      {discount > 0 && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-500 text-white">
            <BadgePercent className="w-3 h-3" />
            ছাড় {discount}%
          </span>
        </div>
      )}
    </div>
  );

  const bodyBlock = (
    <div className="px-4 pb-4 space-y-2">
      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
        {product.titleBn}
      </h3>
      <div className="flex items-center space-x-2">
        <span className="md:text-lg font-bold text-gray-900">
          {formatPrice(product.price)}
        </span>
        {product.comparePrice && product.comparePrice > product.price && (
          <span className="text-sm text-gray-500 line-through">
            {formatPrice(product.comparePrice)}
          </span>
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-stretch gap-2 mt-3">
        <button
          type="button"
          disabled={disabled}
          onClick={handleAddToCart}
          className="btn-primary w-full sm:flex-1 py-2 px-4 text-sm rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-1"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>কার্টে যোগ করুন</span>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={handleOrderNow}
          className="w-full sm:flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm hover:border-gray-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          এখনই অর্ডার করুন
        </button>
      </div>
    </div>
  );

  if (linked) {
    return (
      <Link
        href={`/product/${product.slug}`}
        className="group transition-all duration-300 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl block"
      >
        {imageBlock}
        {bodyBlock}
      </Link>
    );
  }

  return (
    <div className="group transition-all duration-300 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl">
      <Link href={`/product/${product.slug}`} className="block">
        {imageBlock}
      </Link>
      <div className="px-4 pb-4 space-y-2">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {product.titleBn}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="md:text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
        </Link>
        <div className="flex flex-col sm:flex-row items-stretch gap-2 mt-3">
          <button
            type="button"
            disabled={disabled}
            onClick={handleAddToCart}
            className="btn-primary w-full sm:flex-1 py-2 px-4 text-sm rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-1"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>কার্টে যোগ করুন</span>
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={handleOrderNow}
            className="w-full sm:flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm hover:border-gray-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            এখনই অর্ডার করুন
          </button>
        </div>
      </div>
    </div>
  );
}

export { RELATED_CARD_HEIGHTS };
