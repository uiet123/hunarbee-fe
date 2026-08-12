import type { Metadata } from "next";
import { PortalProfile } from "@/components/portal/PortalProfile";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your Hunarbee account settings.",
};

export default function ProfilePage() {
  return <PortalProfile />;
}
