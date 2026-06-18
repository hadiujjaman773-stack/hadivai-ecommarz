import { notFound } from "next/navigation";
import { CategoryHero } from "@/components/category/CategoryHero";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getCategoryBySlug, getProducts } from "@/lib/data";
import { SITE } from "@/data/seed-data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "ক্যাটাগরি পাওয়া যায়নি" };
  return { title: `${category.nameBn} | ${SITE.name}` };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProducts({ categorySlug: slug });

  return (
    <>
      <CategoryHero nameBn={category.nameBn} slug={slug} />
      <section className="py-16 bg-transparent">
        <ProductGrid products={products} bare />
      </section>
    </>
  );
}
