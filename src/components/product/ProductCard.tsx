"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingBag, Heart, BadgePercent } from "lucide-react";
import type { ProductWithCategory } from "@/types";
import { formatPrice, formatPriceWithUnit, calcDiscount } from "@/lib/format";
import { getProductPath } from "@/lib/product-url";
import { useCart } from "@/lib/cart-context";

const DEFAULT_CARD_HEIGHTS = {
  "--card-h": "385px",
  "--card-h-sm": "300px",
  "--card-h-lg": "400px",
} as React.CSSProperties;

export const RELATED_CARD_HEIGHTS = {
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
  const firstVariant = product.variants[0];
  const activePrice = firstVariant?.price ?? product.price;
  const activeCompare = firstVariant?.comparePrice ?? product.comparePrice;
  const discount =
    product.discount ?? calcDiscount(activePrice, activeCompare);
  const productHref = getProductPath(product);

  const cardHeights = cardHeightsOverride ?? DEFAULT_CARD_HEIGHTS;

  const buildCartPayload = () => ({
    productId: product.id,
    slug: product.slug,
    categorySlug: product.category.slug,
    titleBn: firstVariant
      ? `${product.titleBn} (${firstVariant.nameBn})`
      : product.titleBn,
    price: activePrice,
    comparePrice: activeCompare ?? undefined,
    image: firstVariant?.image || product.images[0] || "",
    variantId: firstVariant?.id,
    variantName: firstVariant?.nameBn,
    shippingFree: product.shippingFree ?? false,
    unit: product.unit,
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(buildCartPayload());
    openCart();
  };

  const handleOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(buildCartPayload());
    router.push("/checkout");
  };

  const disabled =
    product.variants.length > 0
      ? !product.variants.some((v) => (v.stock ?? 0) > 0)
      : (product.stock ?? 0) <= 0;

  const imageBlock = (
    <div
      className="relative overflow-hidden rounded-t-lg bg-gray-100 w-full h-[var(--card-h)] sm:h-[var(--card-h-sm)] lg:h-[var(--card-h-lg)] mb-4"
      style={cardHeights}
    >
      {(firstVariant?.image || product.images[0]) && (
        <Image
          src={firstVariant?.image || product.images[0]}
          alt={product.titleBn}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      )}
      {discount > 0 && (
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          <BadgePercent className="w-3 h-3" aria-hidden="true" />
          {discount}%
        </span>
      )}
    </div>
  );

  const bodyBlock = (
    <div className="px-4 pb-4">
      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
        {product.titleBn}
      </h3>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg font-bold text-gray-900">
          {formatPriceWithUnit(activePrice, product.unit)}
        </span>
        {activeCompare && activeCompare > activePrice && (
          <span className="text-sm text-gray-400 line-through">
            {formatPrice(activeCompare)}
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
          className="w-full sm:flex-1 py-2 px-4 text-sm rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed btn-outline"
        >
          এখনই অর্ডার করুন
        </button>
      </div>
    </div>
  );

  if (linked) {
    return (
      <Link
        href={productHref}
        className="group transition-all duration-300 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl block"
      >
        {imageBlock}
        {bodyBlock}
      </Link>
    );
  }

  return (
    <div className="group transition-all duration-300 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl">
      <Link href={productHref} className="block">
        {imageBlock}
      </Link>
      <div className="px-4 pb-4">
        <Link href={productHref}>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem] hover:text-[var(--accent-color)]">
            {product.titleBn}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            {formatPriceWithUnit(activePrice, product.unit)}
          </span>
          {activeCompare && activeCompare > activePrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(activeCompare)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5 text-gray-400" />
          </button>
          <div className="flex flex-col sm:flex-row items-stretch gap-2 flex-1 ml-2">
            <button
              type="button"
              disabled={disabled}
              onClick={handleAddToCart}
              className="btn-primary w-full sm:flex-1 py-2 px-4 text-sm rounded-lg cursor-pointer disabled:opacity-50"
            >
              কার্টে যোগ করুন
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={handleOrderNow}
              className="w-full sm:flex-1 py-2 px-4 text-sm rounded-lg cursor-pointer disabled:opacity-50 btn-outline"
            >
              অর্ডার
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
