"use client";

import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import type { ProductWithCategory } from "@/types";

export function ProductCardActions({
  product,
  firstVariant,
  activePrice,
  activeCompare,
  compact = false,
}: {
  product: ProductWithCategory;
  firstVariant?: ProductWithCategory["variants"][0];
  activePrice: number;
  activeCompare?: number | null;
  compact?: boolean;
}) {
  const { addItem, openCart } = useCart();
  const router = useRouter();

  const disabled =
    product.variants.length > 0
      ? !product.variants.some((v) => (v.stock ?? 0) > 0)
      : (product.stock ?? 0) <= 0;

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

  if (compact) {
    return (
      <div className="flex flex-col sm:flex-row items-stretch gap-2 flex-1 ml-0 sm:ml-2">
        <button
          type="button"
          disabled={disabled}
          onClick={handleAddToCart}
          className="btn-primary w-full sm:flex-1 py-2 px-3 text-xs sm:text-sm rounded-lg disabled:opacity-50"
        >
          কার্ট
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={handleOrderNow}
          className="w-full sm:flex-1 py-2 px-3 text-xs sm:text-sm rounded-lg disabled:opacity-50 btn-outline"
        >
          অর্ডার
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-2 mt-3">
      <button
        type="button"
        disabled={disabled}
        onClick={handleAddToCart}
        className="btn-primary w-full sm:flex-1 py-2 px-3 text-xs sm:text-sm rounded-lg disabled:opacity-50 flex items-center justify-center gap-1"
      >
        <ShoppingBag className="w-4 h-4 shrink-0" />
        <span>কার্টে যোগ</span>
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={handleOrderNow}
        className="w-full sm:flex-1 py-2 px-3 text-xs sm:text-sm rounded-lg disabled:opacity-50 btn-outline"
      >
        এখনই অর্ডার
      </button>
    </div>
  );
}
