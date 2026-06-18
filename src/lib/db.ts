import { prisma } from "@/lib/prisma";
import {
  getDisplayComparePrice,
  getDisplayPrice,
  parseVariants,
} from "@/lib/product-variants";
import {
  deductStockForOrder,
  parseOrderItems,
  restoreStockForOrder,
  validateOrderStock,
} from "@/lib/inventory";
import type { BannerItem, CategoryItem, ProductWithCategory } from "@/types";
import { isInventoryEnabled } from "@/lib/feature-flags";

function mapProduct(
  product: {
    id: string;
    title: string;
    titleBn: string;
    slug: string;
    description: string | null;
    descriptionBn: string | null;
    price: number;
    comparePrice: number | null;
    discount: number | null;
    images: string[];
    variants: unknown;
    unit?: string;
    featured: boolean;
    inStock: boolean;
    stock?: number;
    shippingFree?: boolean;
    category: { id: string; name: string; nameBn: string; slug: string };
  }
): ProductWithCategory {
  const variants = parseVariants(product.variants);
  const price = getDisplayPrice(product.price, variants);
  const comparePrice = getDisplayComparePrice(product.comparePrice, variants);

  return {
    id: product.id,
    title: product.title,
    titleBn: product.titleBn,
    slug: product.slug,
    description: product.description,
    descriptionBn: product.descriptionBn,
    price,
    comparePrice,
    discount: product.discount,
    images: product.images,
    variants,
    unit: product.unit ?? "piece",
    stock: product.stock ?? 0,
    featured: product.featured,
    inStock: product.inStock,
    shippingFree: product.shippingFree ?? false,
    category: product.category,
  };
}

export async function getCategoriesFromDb(): Promise<CategoryItem[]> {
  const cats = await prisma.category.findMany({ orderBy: { nameBn: "asc" } });
  return cats.map((c) => ({
    id: c.id,
    name: c.name,
    nameBn: c.nameBn,
    slug: c.slug,
    image: c.image,
  }));
}

export async function getCategoryFromDb(slug: string) {
  const cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat) return null;
  return {
    id: cat.id,
    name: cat.name,
    nameBn: cat.nameBn,
    slug: cat.slug,
    image: cat.image,
  };
}

export async function getProductsFromDb(options?: {
  categorySlug?: string;
  featured?: boolean;
  limit?: number;
}): Promise<ProductWithCategory[]> {
  const products = await prisma.product.findMany({
    where: {
      ...(options?.categorySlug && {
        category: { slug: options.categorySlug },
      }),
      ...(options?.featured !== undefined && { featured: options.featured }),
    },
    include: { category: true },
    take: options?.limit,
    orderBy: { createdAt: "desc" },
  });
  return products.map(mapProduct);
}

export async function getProductFromDb(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug },
    include: { category: true },
  });
  return product ? mapProduct(product) : null;
}

export async function getProductFromDbByPath(
  categorySlug: string,
  productSlug: string
) {
  let product = await prisma.product.findFirst({
    where: { slug: productSlug, category: { slug: categorySlug } },
    include: { category: true },
  });

  if (!product) {
    product = await prisma.product.findFirst({
      where: { slug: productSlug },
      include: { category: true },
    });
  }

  return product ? mapProduct(product) : null;
}

export async function getBannersFromDb(): Promise<BannerItem[]> {
  const banners = await prisma.banner.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
  return banners.map((b) => ({
    id: b.id,
    title: b.title,
    titleBn: b.titleBn,
    subtitle: b.subtitle,
    subtitleBn: b.subtitleBn,
    image: b.image,
    link: b.link,
  }));
}

export async function createOrderInDb(data: {
  orderNumber: string;
  fullName: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  district?: string;
  note?: string;
  items: unknown;
  subtotal: number;
  shipping: number;
  total: number;
  clientIp?: string;
}) {
  const lineItems = parseOrderItems(data.items);
  if (isInventoryEnabled()) {
    const stockError = await validateOrderStock(lineItems);
    if (stockError) {
      throw new Error(stockError);
    }
  }

  const order = await prisma.order.create({
    data: {
      orderNumber: data.orderNumber,
      fullName: data.fullName,
      email: data.email || null,
      phone: data.phone,
      address: data.address,
      city: data.city,
      district: data.district,
      note: data.note,
      items: data.items as object,
      subtotal: data.subtotal,
      shipping: data.shipping,
      total: data.total,
      clientIp: data.clientIp || null,
    },
  });

  try {
    if (isInventoryEnabled()) {
      await deductStockForOrder(order.id, lineItems);
      return await prisma.order.update({
        where: { id: order.id },
        data: { stockDeducted: true },
      });
    }
    return order;
  } catch (err) {
    await prisma.order.delete({ where: { id: order.id } });
    throw err;
  }
}
