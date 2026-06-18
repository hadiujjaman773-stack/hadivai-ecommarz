export interface ProductVariant {
  id: string;
  nameBn: string;
  price: number;
  comparePrice?: number | null;
  image?: string | null;
  stock?: number;
  inStock: boolean;
}

export interface CartItem {
  productId: string;
  slug: string;
  categorySlug: string;
  titleBn: string;
  price: number;
  comparePrice?: number;
  image: string;
  variantId?: string;
  variantName?: string;
  size?: string;
  unit?: string;
  quantity: number;
  shippingFree?: boolean;
}

export interface ProductWithCategory {
  id: string;
  title: string;
  titleBn: string;
  slug: string;
  description?: string | null;
  descriptionBn?: string | null;
  price: number;
  comparePrice?: number | null;
  discount?: number | null;
  images: string[];
  variants: ProductVariant[];
  unit?: string;
  stock?: number;
  featured: boolean;
  inStock: boolean;
  shippingFree?: boolean;
  category: {
    id: string;
    name: string;
    nameBn: string;
    slug: string;
  };
}

export interface CategoryItem {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  image?: string | null;
}

export interface BannerItem {
  id: string;
  title: string;
  titleBn: string;
  heading?: string | null;
  eyebrow?: string | null;
  subtitle?: string | null;
  subtitleBn?: string | null;
  image: string;
  link?: string | null;
}
