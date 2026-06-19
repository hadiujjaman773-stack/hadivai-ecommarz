import { notFound, redirect } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumb } from "@/components/product/Breadcrumb";
import { getProductByPath, getProducts } from "@/lib/data";
import { getProductPath } from "@/lib/product-url";
import { SITE } from "@/data/seed-data";

export const revalidate = 120;

interface Props {
  params: Promise<{ slug: string; productSlug: string }>;
}

const PARENT_CATEGORIES: Record<string, { label: string; slug: string }> = {
  "bedside-tables": { label: "আসবাবপত্র", slug: "furniture" },
  chairs: { label: "আসবাবপত্র", slug: "furniture" },
  "office-desks": { label: "আসবাবপত্র", slug: "furniture" },
  "bookcases-shelving": { label: "আসবাবপত্র", slug: "furniture" },
  "show-rack": { label: "আসবাবপত্র", slug: "furniture" },
  "media-tv-storage": { label: "আসবাবপত্র", slug: "furniture" },
};

export async function generateMetadata({ params }: Props) {
  const { slug, productSlug } = await params;
  const product = await getProductByPath(slug, productSlug);
  if (!product) return { title: "পণ্য পাওয়া যায়নি" };
  return { title: `${product.titleBn} | ${SITE.name}` };
}

export default async function CategoryProductPage({ params }: Props) {
  const { slug, productSlug } = await params;
  const product = await getProductByPath(slug, productSlug);
  if (!product) notFound();

  const canonicalPath = getProductPath(product);
  const requestedPath = `/category/${slug}/${productSlug}`;
  if (canonicalPath !== requestedPath) {
    redirect(canonicalPath);
  }

  const related = await getProducts({
    categorySlug: product.category.slug,
    limit: 8,
  });

  const relatedFiltered = related.filter((p) => p.slug !== productSlug);

  const parent = PARENT_CATEGORIES[product.category.slug];
  const breadcrumbItems = parent
    ? [
        { label: "হোম", href: "/" },
        { label: parent.label, href: `/category/${parent.slug}` },
        {
          label: product.category.nameBn,
          href: `/category/${product.category.slug}`,
        },
        { label: product.titleBn },
      ]
    : [
        { label: "হোম", href: "/" },
        {
          label: product.category.nameBn,
          href: `/category/${product.category.slug}`,
        },
        { label: product.titleBn },
      ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
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
