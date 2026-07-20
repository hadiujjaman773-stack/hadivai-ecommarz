import { unstable_cache } from "next/cache";
import {
  getBannersFromDb,
  getCategoriesFromDb,
  getCategoryFromDb,
  getProductFromDb,
  getProductFromDbByPath,
  getProductsFromDb,
} from "./db";
import {
  BANNERS,
  CATEGORIES,
  PRODUCTS,
} from "@/data/seed-data";
import type { BannerItem, CategoryItem, ProductWithCategory } from "@/types";

export const CACHE_REVALIDATE = 120;

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
      variants: p.sizes.map((s, i) => ({
        id: `static-var-${idx}-${i}`,
        nameBn: s,
        price: p.price,
        comparePrice: p.comparePrice ?? null,
        image: p.images[0] ?? null,
        inStock: true,
      })),
      unit: "piece",
      featured: p.featured,
      inStock: p.inStock,
      shippingFree: false,
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
    subtitle: b.heading,
    subtitleBn: b.subtitleBn,
    image: b.image,
    link: b.link,
  }));
}

const getCachedCategories = unstable_cache(
  async () => {
    try {
      const cats = await getCategoriesFromDb();
      if (cats.length > 0) return cats;
    } catch {
      /* fallback */
    }
    return staticCategories();
  },
  ["store-categories-v2"],
  { revalidate: CACHE_REVALIDATE, tags: ["categories"] }
);

const getCachedBanners = unstable_cache(
  async () => {
    try {
      const banners = await getBannersFromDb();
      if (banners.length > 0) return banners;
    } catch {
      /* fallback */
    }
    return staticBanners();
  },
  ["store-banners"],
  { revalidate: CACHE_REVALIDATE, tags: ["banners"] }
);

const getCachedAllProducts = unstable_cache(
  async () => {
    try {
      const products = await getProductsFromDb();
      if (products.length > 0) return products;
    } catch {
      /* fallback */
    }
    return staticProducts();
  },
  ["store-products-all-v2"],
  { revalidate: CACHE_REVALIDATE, tags: ["products"] }
);

export async function getCategories(): Promise<CategoryItem[]> {
  return getCachedCategories();
}

export async function getCategoryBySlug(slug: string) {
  return unstable_cache(
    async () => {
      try {
        const cat = await getCategoryFromDb(slug);
        if (cat) return cat;
      } catch {
        /* fallback */
      }
      return staticCategories().find((c) => c.slug === slug) ?? null;
    },
    [`store-category-${slug}`],
    { revalidate: CACHE_REVALIDATE, tags: ["categories", `category-${slug}`] }
  )();
}

export async function getProducts(options?: {
  categorySlug?: string;
  featured?: boolean;
  limit?: number;
}): Promise<ProductWithCategory[]> {
  let list = await getCachedAllProducts();

  if (options?.categorySlug) {
    list = list.filter((p) => p.category.slug === options.categorySlug);
  }
  if (options?.featured) {
    list = list.filter((p) => p.featured);
  }
  if (options?.limit) {
    list = list.slice(0, options.limit);
  }
  return list;
}

export async function getProductBySlug(
  slug: string
): Promise<ProductWithCategory | null> {
  return unstable_cache(
    async () => {
      try {
        const product = await getProductFromDb(slug);
        if (product) return product;
      } catch {
        /* fallback */
      }
      return staticProducts().find((p) => p.slug === slug) ?? null;
    },
    [`store-product-${slug}`],
    { revalidate: CACHE_REVALIDATE, tags: ["products", `product-${slug}`] }
  )();
}

export async function getProductByPath(
  categorySlug: string,
  productSlug: string
): Promise<ProductWithCategory | null> {
  return unstable_cache(
    async () => {
      try {
        const product = await getProductFromDbByPath(
          categorySlug,
          productSlug
        );
        if (product) return product;
      } catch {
        /* fallback */
      }
      return (
        staticProducts().find(
          (p) => p.slug === productSlug && p.category.slug === categorySlug
        ) ??
        staticProducts().find((p) => p.slug === productSlug) ??
        null
      );
    },
    [`store-product-${categorySlug}-${productSlug}`],
    {
      revalidate: CACHE_REVALIDATE,
      tags: ["products", `product-${productSlug}`],
    }
  )();
}

export async function getBanners(): Promise<BannerItem[]> {
  return getCachedBanners();
}

export async function createOrder(data: {
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
  const orderNumber = `MM${Date.now().toString(36).toUpperCase()}`;

  try {
    const { createOrderInDb } = await import("./db");
    return await createOrderInDb({ ...data, orderNumber });
  } catch {
    return { id: orderNumber, orderNumber, ...data, status: "pending" };
  }
}
