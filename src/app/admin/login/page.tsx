import Image from "next/image";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { SITE } from "@/data/seed-data";

export const metadata = { title: "Admin Login" };

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[var(--brand-green-muted)] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-[var(--brand-green)]/10">
        <div className="text-center mb-8">
          <Image
            src={SITE.logo}
            alt={SITE.name}
            width={96}
            height={96}
            className="h-24 w-24 object-contain mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-[var(--brand-green)]">
            Admin Panel
          </h1>
          <p className="text-gray-500 text-sm mt-1">{SITE.name} ব্যবস্থাপনা</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
