import { unstable_cache } from "next/cache";
import { SITE } from "@/data/seed-data";
import { prisma } from "@/lib/prisma";

export interface StoreSettings {
  siteName: string;
  tagline: string | null;
  description: string | null;
  footerText: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  facebook: string | null;
  messenger: string | null;
  logo: string | null;
}

const fallbackSettings: StoreSettings = {
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
};

const getCachedStoreSettings = unstable_cache(
  async (): Promise<StoreSettings> => {
    try {
      const settings = await prisma.settings.findFirst();
      if (settings) {
        return {
          siteName: settings.siteName,
          tagline: settings.tagline,
          description: settings.description,
          footerText: settings.footerText,
          phone: settings.phone,
          whatsapp: settings.whatsapp,
          email: settings.email,
          facebook: settings.facebook,
          messenger: settings.messenger,
          logo: settings.logo,
        };
      }
    } catch {
      // Keep the storefront available if the database is temporarily unavailable.
    }
    return fallbackSettings;
  },
  ["store-settings"],
  { revalidate: 120, tags: ["settings"] }
);

export async function getStoreSettings(): Promise<StoreSettings> {
  return getCachedStoreSettings();
}
