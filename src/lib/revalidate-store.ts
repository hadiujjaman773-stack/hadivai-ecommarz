import { revalidatePath, revalidateTag } from "next/cache";

type StoreCacheScope =
  | "products"
  | "categories"
  | "banners"
  | "settings"
  | "all";

function expireTag(tag: string) {
  // Immediate expire so the next request waits for fresh data
  // instead of serving stale-while-revalidate content.
  revalidateTag(tag, { expire: 0 });
}

function revalidateShopPaths() {
  // Shop layout wraps header/footer + all storefront pages.
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/category", "layout");
  revalidatePath("/product", "layout");
  revalidatePath("/contact-us");
  revalidatePath("/about-us");
}

/**
 * Invalidate storefront caches after admin CRUD.
 * Uses immediate tag expiration + shop path revalidation.
 */
export function revalidateStoreCache(scope: StoreCacheScope) {
  const tags = new Set<string>();

  if (scope === "all" || scope === "products") {
    tags.add("products");
    tags.add("categories");
  }
  if (scope === "all" || scope === "categories") {
    tags.add("categories");
    tags.add("products");
  }
  if (scope === "all" || scope === "banners") {
    tags.add("banners");
  }
  if (scope === "all" || scope === "settings") {
    tags.add("settings");
  }

  for (const tag of tags) {
    expireTag(tag);
  }

  revalidateShopPaths();
}
