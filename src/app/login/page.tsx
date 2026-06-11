import { SignInForm } from "@/components/auth/SignInForm";

export const metadata = {
  title: "Sign in | Mosafa Mart",
};

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SignInForm />
    </div>
  );
}
