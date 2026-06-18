import { prisma } from "@/lib/prisma";
import { getUnitLabel } from "@/lib/product-units";
import { parseVariants } from "@/lib/product-variants";
import type { ProductVariant } from "@/types";

export const LOW_STOCK_THRESHOLD = 5;

export const STOCK_MOVEMENT_TYPES = {
  purchase: "ক্রয় / স্টক ইন",
  adjustment: "ম্যানুয়াল সমন্বয়",
  sale: "বিক্রয় (অর্ডার)",
  return: "রিটার্ন",
  cancel: "অর্ডার বাতিল",
  damage: "ক্ষতি / নষ্ট",
} as const;

export type StockMovementType = keyof typeof STOCK_MOVEMENT_TYPES;

export const EXPENSE_CATEGORIES = [
  { value: "purchase", label: "পণ্য ক্রয়" },
  { value: "rent", label: "ভাড়া" },
  { value: "utility", label: "ইউটিলিটি" },
  { value: "salary", label: "বেতন" },
  { value: "transport", label: "পরিবহন" },
  { value: "other", label: "অন্যান্য" },
] as const;

export const RETURN_STATUSES = [
  { value: "pending", label: "অপেক্ষমাণ" },
  { value: "approved", label: "অনুমোদিত" },
  { value: "rejected", label: "প্রত্যাখ্যাত" },
] as const;

export interface OrderStockItem {
  productId: string;
  variantId?: string;
  quantity: number;
  titleBn?: string;
}

export function getTotalStock(baseStock: number, variants: ProductVariant[]): number {
  if (variants.length > 0) {
    return variants.reduce((sum, v) => sum + Math.max(0, v.stock ?? 0), 0);
  }
  return Math.max(0, baseStock);
}

export function syncProductStockFields(
  baseStock: number,
  variants: ProductVariant[]
): { stock: number; variants: ProductVariant[]; inStock: boolean } {
  if (variants.length > 0) {
    const normalized = variants.map((v) => {
      const stock = Math.max(0, Math.floor(v.stock ?? 0));
      return {
        ...v,
        stock,
        inStock: stock > 0,
      };
    });
    const total = normalized.reduce((s, v) => s + v.stock, 0);
    return {
      stock: total,
      variants: normalized,
      inStock: total > 0,
    };
  }

  const stock = Math.max(0, Math.floor(baseStock));
  return { stock, variants: [], inStock: stock > 0 };
}

function getVariantStock(variants: ProductVariant[], variantId?: string): number {
  if (!variantId) return 0;
  return variants.find((v) => v.id === variantId)?.stock ?? 0;
}

function setVariantStock(
  variants: ProductVariant[],
  variantId: string,
  newStock: number
): ProductVariant[] {
  return variants.map((v) =>
    v.id === variantId
      ? { ...v, stock: newStock, inStock: newStock > 0 }
      : v
  );
}

export async function validateOrderStock(
  items: OrderStockItem[]
): Promise<string | null> {
  for (const item of items) {
    if (!item.productId || item.productId.startsWith("static-")) continue;

    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });
    if (!product) continue;

    const variants = parseVariants(product.variants);
    const qty = Math.max(1, item.quantity);

    if (variants.length > 0) {
      if (!item.variantId) {
        return `${product.titleBn}: ভ্যারিয়েন্ট নির্বাচন প্রয়োজন`;
      }
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant) {
        return `${product.titleBn}: ভ্যারিয়েন্ট পাওয়া যায়নি`;
      }
      if ((variant.stock ?? 0) < qty) {
        return `${product.titleBn} (${variant.nameBn}): স্টক অপর্যাপ্ত (আছে ${variant.stock ?? 0})`;
      }
    } else if (product.stock < qty) {
      return `${product.titleBn}: স্টক অপর্যাপ্ত (আছে ${product.stock})`;
    }
  }
  return null;
}

export async function adjustProductStock(params: {
  productId: string;
  variantId?: string;
  quantity: number;
  direction: "in" | "out";
  type: StockMovementType;
  note?: string;
  orderId?: string;
  returnId?: string;
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.productId },
  });
  if (!product) throw new Error("পণ্য পাওয়া যায়নি");

  const variants = parseVariants(product.variants);
  const qty = Math.max(1, Math.floor(params.quantity));
  let stockBefore = 0;
  let stockAfter = 0;
  let variantName: string | null = null;

  if (variants.length > 0) {
    if (!params.variantId) throw new Error("ভ্যারিয়েন্ট নির্বাচন প্রয়োজন");
    const variant = variants.find((v) => v.id === params.variantId);
    if (!variant) throw new Error("ভ্যারিয়েন্ট পাওয়া যায়নি");

    stockBefore = variant.stock ?? 0;
    stockAfter =
      params.direction === "in" ? stockBefore + qty : stockBefore - qty;
    if (stockAfter < 0) throw new Error("স্টক অপর্যাপ্ত");
    variantName = variant.nameBn;

    const updatedVariants = setVariantStock(variants, params.variantId, stockAfter);
    const synced = syncProductStockFields(0, updatedVariants);

    await prisma.product.update({
      where: { id: product.id },
      data: {
        stock: synced.stock,
        variants: synced.variants as object,
        inStock: synced.inStock,
      },
    });
  } else {
    stockBefore = product.stock;
    stockAfter =
      params.direction === "in" ? stockBefore + qty : stockBefore - qty;
    if (stockAfter < 0) throw new Error("স্টক অপর্যাপ্ত");

    await prisma.product.update({
      where: { id: product.id },
      data: {
        stock: stockAfter,
        inStock: stockAfter > 0,
      },
    });
  }

  await prisma.stockMovement.create({
    data: {
      productId: product.id,
      productName: product.titleBn,
      variantId: params.variantId ?? null,
      variantName,
      type: params.type,
      direction: params.direction,
      quantity: qty,
      stockBefore,
      stockAfter,
      unit: product.unit,
      note: params.note ?? null,
      orderId: params.orderId ?? null,
      returnId: params.returnId ?? null,
    },
  });

  return { stockBefore, stockAfter, unit: getUnitLabel(product.unit) };
}

export async function deductStockForOrder(
  orderId: string,
  items: OrderStockItem[]
) {
  for (const item of items) {
    if (!item.productId || item.productId.startsWith("static-")) continue;
    await adjustProductStock({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      direction: "out",
      type: "sale",
      orderId,
      note: `অর্ডার থেকে বিক্রয়`,
    });
  }
}

export async function restoreStockForOrder(
  orderId: string,
  items: OrderStockItem[],
  type: "cancel" | "return" = "cancel"
) {
  for (const item of items) {
    if (!item.productId || item.productId.startsWith("static-")) continue;
    await adjustProductStock({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      direction: "in",
      type,
      orderId,
      note: type === "cancel" ? "অর্ডার বাতিল" : "অর্ডার রিটার্ন",
    });
  }
}

export function parseOrderItems(raw: unknown): OrderStockItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((i) => i && typeof i === "object")
    .map((i) => {
      const item = i as Record<string, unknown>;
      return {
        productId: String(item.productId ?? ""),
        variantId: item.variantId ? String(item.variantId) : undefined,
        quantity: Math.max(1, Number(item.quantity) || 1),
        titleBn: item.titleBn ? String(item.titleBn) : undefined,
      };
    })
    .filter((i) => i.productId);
}

export function generateReturnNumber() {
  return `RT${Date.now().toString(36).toUpperCase()}`;
}
