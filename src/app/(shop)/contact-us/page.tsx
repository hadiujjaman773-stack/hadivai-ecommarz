import { SITE } from "@/data/seed-data";
import { getStoreSettings } from "@/lib/store-settings";

export const metadata = {
  title: `যোগাযোগ | ${SITE.name}`,
};

export default async function ContactUsPage() {
  const settings = await getStoreSettings();
  const whatsappNumber = settings.whatsapp?.replace(/\D/g, "");

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">যোগাযোগ করুন</h1>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 space-y-6 max-w-3xl">
        {settings.phone && (
          <div>
            <h2 className="font-semibold text-gray-800 mb-1">ফোন</h2>
            <a href={`tel:${settings.phone}`} className="brand-text hover:underline">
              {settings.phone}
            </a>
          </div>
        )}
        {settings.whatsapp && (
          <div>
            <h2 className="font-semibold text-gray-800 mb-1">WhatsApp</h2>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="brand-text hover:underline"
            >
              {settings.whatsapp}
            </a>
          </div>
        )}
        {settings.email && (
          <div>
            <h2 className="font-semibold text-gray-800 mb-1">ইমেইল</h2>
            <a
              href={`mailto:${settings.email}`}
              className="brand-text hover:underline"
            >
              {settings.email}
            </a>
          </div>
        )}
        {settings.facebook && (
          <div>
            <h2 className="font-semibold text-gray-800 mb-1">Facebook</h2>
            <a
              href={settings.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="brand-text hover:underline"
            >
              Facebook পেজ
            </a>
          </div>
        )}
        <p className="text-gray-600">
          যেকোনো প্রশ্ন বা অর্ডার সম্পর্কিত সহায়তার জন্য আমাদের সাথে যোগাযোগ
          করুন।
        </p>
      </div>
    </div>
  );
}
