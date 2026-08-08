import type { Metadata } from "next";
import { PaymentPlaceholder } from "@/components/apply/PaymentPlaceholder";

export const metadata: Metadata = {
  title: "Payment",
  description: "Secure your Hunarbee internship enrollment. Payment coming soon.",
};

export default function ApplyPaymentPage() {
  return <PaymentPlaceholder />;
}
