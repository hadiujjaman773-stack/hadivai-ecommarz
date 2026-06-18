import { getUnitLabel } from "@/lib/product-units";

export function formatPrice(amount: number): string {
  return `৳${amount.toLocaleString("en-BD")}`;
}

export function formatPriceWithUnit(amount: number, unit?: string | null): string {
  return `${formatPrice(amount)} / ${getUnitLabel(unit)}`;
}

export function calcDiscount(price: number, comparePrice?: number | null): number {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}
