import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { SITE } from "@/data/seed-data";

export const metadata = {
  title: `চেকআউট | ${SITE.name}`,
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}
