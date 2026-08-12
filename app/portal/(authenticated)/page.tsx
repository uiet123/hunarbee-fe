import type { Metadata } from "next";
import { PortalDashboard } from "@/components/portal/PortalDashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Hunarbee internship workspace.",
};

export default function PortalHomePage() {
  return <PortalDashboard />;
}
