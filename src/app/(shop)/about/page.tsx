import { SITE } from "@/data/seed-data";

export const metadata = {
  title: `আমাদের সম্পর্কে | ${SITE.name}`,
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">আমাদের সম্পর্কে</h1>
      <div className="bg-white rounded-xl border p-8 space-y-4 text-gray-700 leading-relaxed">
        <p>
          <strong>{SITE.name}</strong> – {SITE.tagline}
        </p>
        <p>{SITE.description}</p>
        <p>
          আমরা মানসম্মত হোম ও লাইফস্টাইল পণ্য সরবরাহ করি। আধুনিক ডিজাইন,
          টেকসই উপকরণ এবং সাশ্রয়ী মূল্যে আপনার ঘরকে সুন্দর করে তুলতে
          আমরা প্রতিশ্রুতিবদ্ধ।
        </p>
      </div>
    </div>
  );
}
