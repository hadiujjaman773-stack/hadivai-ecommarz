export interface CartItem {
  productId: string;
  slug: string;
  titleBn: string;
  price: number;
  comparePrice?: number;
  image: string;
  size?: string;
  quantity: number;
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
  sizes: string[];
  featured: boolean;
  inStock: boolean;
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
