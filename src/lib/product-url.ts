export function getProductPath(product: {
  slug: string;
  category: { slug: string };
}) {
  return `/category/${product.category.slug}/${product.slug}`;
}
