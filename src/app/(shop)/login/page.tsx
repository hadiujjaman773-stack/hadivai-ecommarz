import { SignInForm } from "@/components/auth/SignInForm";
import { SITE } from "@/data/seed-data";

export const metadata = {
  title: `লগইন | ${SITE.name}`,
};

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SignInForm />
    </div>
  );
}
