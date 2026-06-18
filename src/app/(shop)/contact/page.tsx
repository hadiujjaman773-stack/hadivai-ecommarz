import { SITE } from "@/data/seed-data";

export const metadata = {
  title: `যোগাযোগ | ${SITE.name}`,
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">যোগাযোগ করুন</h1>
      <div className="bg-white rounded-xl border p-8 space-y-6">
        <div>
          <h2 className="font-semibold text-gray-800 mb-1">ফোন</h2>
          <a
            href={`tel:${SITE.phone}`}
            className="text-[var(--primary-color)] hover:underline"
          >
            {SITE.phone}
          </a>
        </div>
        <div>
          <h2 className="font-semibold text-gray-800 mb-1">WhatsApp</h2>
          <a
            href={`https://wa.me/${SITE.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--primary-color)] hover:underline"
          >
            {SITE.whatsapp}
          </a>
        </div>
        <p className="text-gray-600">
          যেকোনো প্রশ্ন বা অর্ডার সম্পর্কিত সহায়তার জন্য আমাদের সাথে যোগাযোগ
          করুন।
        </p>
      </div>
    </div>
  );
}
