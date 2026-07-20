import { notFound, redirect } from "next/navigation";
import { getProductByPath } from "@/lib/data";
import { getProductPath } from "@/lib/product-url";

interface Props {
  params: Promise<{ slug: string; productSlug: string }>;
}

export default async function LegacyCategoryProductRedirect({ params }: Props) {
  const { slug, productSlug } = await params;
  const product = await getProductByPath(slug, productSlug);
  if (!product) notFound();
  redirect(getProductPath(product));
}
