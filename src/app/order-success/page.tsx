import Link from "next/link";

interface Props {
  searchParams: Promise<{ order?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { order } = await searchParams;

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-xl border p-8 shadow-sm">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✓</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          অর্ডার সফল হয়েছে!
        </h1>
        <p className="text-gray-600 mb-4">
          আপনার অর্ডার সফলভাবে জমা হয়েছে। শীঘ্রই আমরা আপনার সাথে যোগাযোগ
          করব।
        </p>
        {order && (
          <p className="text-sm text-gray-500 mb-6">
            অর্ডার নম্বর:{" "}
            <span className="font-semibold text-[var(--primary-color)]">
              {order}
            </span>
          </p>
        )}
        <Link
          href="/"
          className="inline-block bg-[var(--primary-color)] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[var(--primary-color-dark)]"
        >
          হোমে ফিরে যান
        </Link>
      </div>
    </div>
  );
}
