import {
  BANNERS,
  CATEGORIES,
  PRODUCTS,
} from "@/data/seed-data";
import type { BannerItem, CategoryItem, ProductWithCategory } from "@/types";

function staticProducts(): ProductWithCategory[] {
  return PRODUCTS.map((p, idx) => {
    const cat = CATEGORIES.find((c) => c.slug === p.categorySlug)!;
    const discount =
      p.comparePrice && p.comparePrice > p.price
        ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)
        : 0;
    return {
      id: `static-${idx}`,
      title: p.title,
      titleBn: p.titleBn,
      slug: p.slug,
      description: null,
      descriptionBn: p.descriptionBn,
      price: p.price,
      comparePrice: p.comparePrice,
      discount,
      images: p.images,
      sizes: p.sizes,
      featured: p.featured,
      inStock: true,
      category: {
        id: `cat-${cat.slug}`,
        name: cat.name,
        nameBn: cat.nameBn,
        slug: cat.slug,
      },
    };
  });
}

function staticCategories(): CategoryItem[] {
  return CATEGORIES.map((c, idx) => ({
    id: `cat-${idx}`,
    name: c.name,
    nameBn: c.nameBn,
    slug: c.slug,
    image: c.image,
  }));
}

function staticBanners(): BannerItem[] {
  return BANNERS.map((b, idx) => ({
    id: `banner-${idx}`,
    title: b.title,
    titleBn: b.titleBn,
    heading: b.heading,
    eyebrow: b.eyebrow,
    subtitle: b.subtitle,
    subtitleBn: b.subtitleBn,
    image: b.image,
    link: b.link,
  }));
}

async function getDb() {
  try {
    const { getProductsFromDb, getCategoriesFromDb, getBannersFromDb, getCategoryFromDb, getProductFromDb } = await import("./db");
    return { getProductsFromDb, getCategoriesFromDb, getBannersFromDb, getCategoryFromDb, getProductFromDb };
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<CategoryItem[]> {
  const db = await getDb();
  if (db) {
    try {
      const cats = await db.getCategoriesFromDb();
      if (cats.length > 0) return cats;
    } catch {
      /* fallback */
    }
  }
  return staticCategories();
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (db) {
    try {
      const cat = await db.getCategoryFromDb(slug);
      if (cat) return cat;
    } catch {
      /* fallback */
    }
  }
  return staticCategories().find((c) => c.slug === slug) ?? null;
}

export async function getProducts(options?: {
  categorySlug?: string;
  featured?: boolean;
  limit?: number;
}): Promise<ProductWithCategory[]> {
  const db = await getDb();
  if (db) {
    try {
      const products = await db.getProductsFromDb(options);
      if (products.length > 0) {
        let list = products;
        if (options?.limit) list = list.slice(0, options.limit);
        return list;
      }
    } catch {
      /* fallback */
    }
  }

  let list = staticProducts();
  if (options?.categorySlug) {
    list = list.filter((p) => p.category.slug === options.categorySlug);
  }
  if (options?.featured) {
    list = list.filter((p) => p.featured);
  }
  if (options?.limit) list = list.slice(0, options.limit);
  return list;
}

export async function getProductBySlug(
  slug: string
): Promise<ProductWithCategory | null> {
  const db = await getDb();
  if (db) {
    try {
      const product = await db.getProductFromDb(slug);
      if (product) return product;
    } catch {
      /* fallback */
    }
  }
  return staticProducts().find((p) => p.slug === slug) ?? null;
}

export async function getBanners(): Promise<BannerItem[]> {
  const db = await getDb();
  if (db) {
    try {
      const banners = await db.getBannersFromDb();
      if (banners.length > 0) return banners;
    } catch {
      /* fallback */
    }
  }
  return staticBanners();
}

export async function createOrder(data: {
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
  const orderNumber = `MM${Date.now().toString(36).toUpperCase()}`;

  try {
    const { createOrderInDb } = await import("./db");
    return await createOrderInDb({ ...data, orderNumber });
  } catch {
    return { id: orderNumber, orderNumber, ...data, status: "pending" };
  }
}
