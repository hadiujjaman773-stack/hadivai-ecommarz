import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  BANNERS,
  CATEGORIES,
  PRODUCTS,
  SITE,
} from "../src/data/seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.shipping.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.user.deleteMany();

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

  const shippingInside = await prisma.shipping.create({
    data: {
      name: "Inside Dhaka",
      nameBn: "ঢাকার ভেতরে",
      price: SITE.shippingInsideDhaka,
      active: true,
    },
  });

  const shippingOutside = await prisma.shipping.create({
    data: {
      name: "Outside Dhaka",
      nameBn: "ঢাকার বাহিরে",
      price: SITE.shippingOutsideDhaka,
      active: true,
    },
  });

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
        variants: product.sizes.map((size, i) => ({
          id: `seed-var-${product.slug}-${i}`,
          nameBn: size,
          price: product.price,
          comparePrice: product.comparePrice ?? null,
          image: product.images[0] ?? null,
          inStock: true,
        })),
        categoryId,
        featured: product.featured,
        shippingFree: false,
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

  await prisma.settings.create({
    data: {
      siteName: SITE.name,
      tagline: SITE.tagline,
      description: SITE.description,
      footerText: SITE.footerText,
      phone: SITE.phone,
      whatsapp: SITE.whatsapp,
      messenger: SITE.messenger,
      logo: SITE.logo,
      shippingInsideDhaka: SITE.shippingInsideDhaka,
      shippingOutsideDhaka: SITE.shippingOutsideDhaka,
    },
  });

  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  await prisma.user.create({
    data: {
      email: "admin@mosafamart.com",
      passwordHash: await bcrypt.hash(adminPassword, 12),
      name: "Super Admin",
      role: "SUPER_ADMIN",
    },
  });

  console.log("Seed completed!");
  console.log(`Admin login: admin@mosafamart.com / ${adminPassword}`);
  console.log(`Shipping options: ${shippingInside.nameBn}, ${shippingOutside.nameBn}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
