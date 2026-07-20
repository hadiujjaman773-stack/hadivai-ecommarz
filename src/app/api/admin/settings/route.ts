import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/admin-api";
import { SITE } from "@/data/seed-data";
import { revalidateStoreCache } from "@/lib/revalidate-store";

async function getOrCreateSettings() {
  let settings = await prisma.settings.findFirst();
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        siteName: SITE.name,
        tagline: SITE.tagline,
        description: SITE.description,
        footerText: SITE.footerText,
        phone: SITE.phone,
        whatsapp: SITE.whatsapp,
        email: SITE.email,
        facebook: SITE.facebook,
        messenger: SITE.messenger,
        logo: SITE.logo,
        shippingInsideDhaka: SITE.shippingInsideDhaka,
        shippingOutsideDhaka: SITE.shippingOutsideDhaka,
      },
    });
  }
  return settings;
}

export async function GET() {
  return withAuth(async () => {
    const settings = await getOrCreateSettings();
    return NextResponse.json(settings);
  });
}

export async function PUT(request: Request) {
  return withAuth(async () => {
    const body = await request.json();
    const existing = await getOrCreateSettings();

    const settings = await prisma.settings.update({
      where: { id: existing.id },
      data: {
        siteName: body.siteName ?? existing.siteName,
        tagline: body.tagline ?? existing.tagline,
        description: body.description ?? existing.description,
        footerText: body.footerText ?? existing.footerText,
        phone: body.phone ?? existing.phone,
        whatsapp: body.whatsapp ?? existing.whatsapp,
        email: body.email ?? existing.email,
        facebook: body.facebook ?? existing.facebook,
        messenger: body.messenger ?? existing.messenger,
        logo: body.logo ?? existing.logo,
        shippingInsideDhaka:
          body.shippingInsideDhaka ?? existing.shippingInsideDhaka,
        shippingOutsideDhaka:
          body.shippingOutsideDhaka ?? existing.shippingOutsideDhaka,
      },
    });
    revalidateStoreCache("settings");
    return NextResponse.json(settings);
  });
}
