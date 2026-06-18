import { SITE } from "@/data/seed-data";

export const metadata = {
  title: `আমাদের সম্পর্কে | ${SITE.name}`,
};

export default function AboutUsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">আমাদের সম্পর্কে</h1>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 space-y-4 text-gray-700 leading-relaxed max-w-3xl">
        <p>
          <strong>{SITE.name}</strong> – {SITE.tagline}
        </p>
        <p>{SITE.footerText}</p>
      </div>
    </div>
  );
}
