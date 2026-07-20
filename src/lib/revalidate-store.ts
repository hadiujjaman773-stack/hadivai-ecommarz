import { revalidateTag } from "next/cache";

export function revalidateStoreCache(
  scope: "products" | "categories" | "banners" | "settings" | "all"
) {
  if (scope === "all" || scope === "products") {
    revalidateTag("products", "max");
  }
  if (scope === "all" || scope === "categories") {
    revalidateTag("categories", "max");
  }
  if (scope === "all" || scope === "banners") {
    revalidateTag("banners", "max");
  }
  if (scope === "all" || scope === "settings") {
    revalidateTag("settings", "max");
  }
}
