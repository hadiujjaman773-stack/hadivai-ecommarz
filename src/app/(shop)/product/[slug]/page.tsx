import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumb } from "@/components/product/Breadcrumb";
import { getProductBySlug } from "@/lib/data";
import { getProducts } from "@/lib/data";
import { SITE } from "@/data/seed-data";

export const revalidate = 120;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "পণ্য পাওয়া যায়নি" };
  return { title: `${product.titleBn} | ${SITE.name}` };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getProducts({
    categorySlug: product.category.slug,
    limit: 8,
  });
  const relatedFiltered = related.filter((item) => item.slug !== slug);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "হোম", href: "/" },
          {
            label: product.category.nameBn,
            href: `/category/${product.category.slug}`,
          },
          { label: product.titleBn },
        ]}
      />
      <ProductDetail product={product} />
      {relatedFiltered.length > 0 && (
        <section className="py-16 bg-transparent">
          <ProductGrid
            products={relatedFiltered}
            title="আপনার জন্য আরও পছন্দের পণ্য"
            variant="related"
            bare
          />
        </section>
      )}
    </>
  );
}
