import dynamic from "next/dynamic";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getBanners, getCategories, getProducts } from "@/lib/data";

export const revalidate = 120;

const HeroSlider = dynamic(
  () =>
    import("@/components/home/HeroSlider").then((mod) => mod.HeroSlider),
  {
    loading: () => (
      <div
        className="w-full bg-gray-100 animate-pulse h-[280px] sm:h-[400px] md:h-[480px]"
        aria-hidden
      />
    ),
  }
);

export default async function HomePage() {
  const [banners, categories, allProducts] = await Promise.all([
    getBanners(),
    getCategories(),
    getProducts(),
  ]);

  const featuredProducts = allProducts.filter((p) => p.featured).slice(0, 8);
  const popularProducts = allProducts.slice(0, 12);

  return (
    <>
      <HeroSlider banners={banners} />
      <CategoryGrid categories={categories} />
      <ProductGrid
        products={featuredProducts}
        title="গ্রাহকদের পছন্দের সেরা পণ্য"
        variant="featured"
      />
      <ProductGrid
        products={popularProducts}
        title="সবার পছন্দের সেরা পণ্য"
        subtitle="নতুন আসা পণ্য, বেস্ট সেলার ও ট্রেন্ডিং আইটেম এখন একসাথে"
        variant="popular"
      />
    </>
  );
}
