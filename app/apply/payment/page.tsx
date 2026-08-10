import { redirect } from "next/navigation";

/** Payment is handled on /apply via Razorpay Checkout — keep old URL working. */
export default function ApplyPaymentPage() {
  redirect("/apply");
}
