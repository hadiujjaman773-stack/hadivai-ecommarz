import { prisma } from "@/lib/prisma";
import type { BannerItem, CategoryItem, ProductWithCategory } from "@/types";

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
    sizes: string[];
    featured: boolean;
    inStock: boolean;
    category: { id: string; name: string; nameBn: string; slug: string };
  }
): ProductWithCategory {
  return {
    id: product.id,
    title: product.title,
    titleBn: product.titleBn,
    slug: product.slug,
    description: product.description,
    descriptionBn: product.descriptionBn,
    price: product.price,
    comparePrice: product.comparePrice,
    discount: product.discount,
    images: product.images,
    sizes: product.sizes,
    featured: product.featured,
    inStock: product.inStock,
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
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
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
  phone: string;
  address: string;
  city: string;
  district?: string;
  note?: string;
  items: unknown;
  subtotal: number;
  shipping: number;
  total: number;
}) {
  return prisma.order.create({
    data: {
      orderNumber: data.orderNumber,
      fullName: data.fullName,
      phone: data.phone,
      address: data.address,
      city: data.city,
      district: data.district,
      note: data.note,
      items: data.items as object,
      subtotal: data.subtotal,
      shipping: data.shipping,
      total: data.total,
    },
  });
}
