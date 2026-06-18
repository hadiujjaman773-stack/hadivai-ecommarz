import Link from "next/link";
import { SITE } from "@/data/seed-data";

export const metadata = {
  title: `রেজিস্ট্রেশন | ${SITE.name}`,
};

export default function SignupPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-md mx-auto text-center bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          অ্যাকাউন্ট তৈরি
        </h1>
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          গ্রাহক হিসেবে কেনাকাটা করতে অ্যাকাউন্টের প্রয়োজন নেই — সরাসরি পণ্য
          কার্টে যোগ করে অর্ডার করতে পারবেন।
        </p>
        <p className="text-gray-600 text-sm mb-8 leading-relaxed">
          <strong>অ্যাডমিন অ্যাকাউন্ট</strong> শুধু সুপার অ্যাডমিন তৈরি করতে
          পারেন। ইতিমধ্যে অ্যাকাউন্ট থাকলে লগইন করুন।
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="btn-primary px-6 py-2.5 font-semibold text-center"
          >
            লগইন করুন
          </Link>
          <Link
            href="/"
            className="px-6 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 text-center"
          >
            কেনাকাটা শুরু করুন
          </Link>
        </div>
      </div>
    </div>
  );
}
