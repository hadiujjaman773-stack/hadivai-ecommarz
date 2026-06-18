import { notFound, redirect } from "next/navigation";
import { getProductBySlug } from "@/lib/data";
import { getProductPath } from "@/lib/product-url";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LegacyProductRedirect({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  redirect(getProductPath(product));
}
