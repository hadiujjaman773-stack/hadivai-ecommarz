import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { CATEGORIES, PRODUCTS } from "../src/data/seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Replacing categories and products...");

  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const categoryIds = new Map<string, string>();

  for (const category of CATEGORIES) {
    const created = await prisma.category.create({
      data: {
        name: category.name,
        nameBn: category.nameBn,
        slug: category.slug,
        image: category.image,
      },
    });
    categoryIds.set(category.slug, created.id);
  }

  for (const product of PRODUCTS) {
    const categoryId = categoryIds.get(product.categorySlug);
    if (!categoryId) {
      throw new Error(`Category not found for ${product.slug}`);
    }

    await prisma.product.create({
      data: {
        title: product.title,
        titleBn: product.titleBn,
        slug: product.slug,
        descriptionBn: product.descriptionBn,
        price: product.price,
        comparePrice: product.comparePrice,
        images: product.images,
        variants: [],
        unit: "piece",
        stock: 0,
        categoryId,
        featured: product.featured,
        shippingFree: false,
        inStock: product.inStock,
      },
    });
  }

  console.log(
    `Catalog replaced: ${CATEGORIES.length} categories, ${PRODUCTS.length} products.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
