import type { ProductVariant } from "@/types";

export function parseVariants(raw: unknown): ProductVariant[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((v) => v && typeof v === "object")
    .map((v) => {
      const item = v as Record<string, unknown>;
      const stock = Math.max(0, Math.floor(Number(item.stock) || 0));
      return {
        id: String(item.id ?? newVariantId()),
        nameBn: String(item.nameBn ?? ""),
        price: Number(item.price) || 0,
        comparePrice:
          item.comparePrice != null ? Number(item.comparePrice) : null,
        image: item.image ? String(item.image) : null,
        stock,
        inStock: stock > 0 && item.inStock !== false,
      };
    })
    .filter((v) => v.nameBn && v.price > 0);
}

export function getDisplayPrice(
  basePrice: number,
  variants: ProductVariant[]
): number {
  if (variants.length === 0) return basePrice;
  return Math.min(...variants.map((v) => v.price));
}

export function getDisplayComparePrice(
  baseCompare: number | null | undefined,
  variants: ProductVariant[]
): number | null {
  if (variants.length === 0) return baseCompare ?? null;
  const prices = variants
    .map((v) => v.comparePrice)
    .filter((p): p is number => p != null && p > 0);
  return prices.length ? Math.min(...prices) : baseCompare ?? null;
}

export function getVariantStock(variant: ProductVariant | null): number {
  return variant?.stock ?? 0;
}

export function newVariantId() {
  return `var-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
