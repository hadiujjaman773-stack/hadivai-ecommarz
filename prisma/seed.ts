import { PrismaClient } from "@prisma/client";
import {
  BANNERS,
  CATEGORIES,
  PRODUCTS,
} from "../src/data/seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.banner.deleteMany();

  const categoryMap = new Map<string, string>();

  for (const cat of CATEGORIES) {
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        nameBn: cat.nameBn,
        slug: cat.slug,
        image: cat.image,
      },
    });
    categoryMap.set(cat.slug, created.id);
  }

  for (const product of PRODUCTS) {
    const categoryId = categoryMap.get(product.categorySlug);
    if (!categoryId) continue;

    const discount =
      product.comparePrice && product.comparePrice > product.price
        ? Math.round(
            ((product.comparePrice - product.price) / product.comparePrice) *
              100
          )
        : null;

    await prisma.product.create({
      data: {
        title: product.title,
        titleBn: product.titleBn,
        slug: product.slug,
        descriptionBn: product.descriptionBn,
        price: product.price,
        comparePrice: product.comparePrice,
        discount,
        images: product.images,
        sizes: product.sizes,
        categoryId,
        featured: product.featured,
      },
    });
  }

  for (let i = 0; i < BANNERS.length; i++) {
    const banner = BANNERS[i];
    await prisma.banner.create({
      data: {
        title: banner.title,
        titleBn: banner.titleBn,
        subtitle: banner.heading,
        subtitleBn: banner.subtitleBn,
        image: banner.image,
        link: banner.link,
        order: i,
      },
    });
  }

  console.log("Seed completed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
