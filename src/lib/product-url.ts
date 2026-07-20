export function getProductPath(product: {
  slug: string;
  category?: { slug: string };
}) {
  return `/product/${product.slug}`;
}
