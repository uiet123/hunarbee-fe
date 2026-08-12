import type { Metadata } from "next";
import { PortalLoginExperience } from "@/components/portal/PortalLoginExperience";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the Hunarbee student internship portal.",
};

export default function PortalLoginPage() {
  return <PortalLoginExperience />;
}
