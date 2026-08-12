import type { Metadata } from "next";
import { PortalSchedule } from "@/components/portal/PortalSchedule";

export const metadata: Metadata = {
  title: "Schedule",
  description: "View your upcoming sessions and deadlines.",
};

export default function SchedulePage() {
  return <PortalSchedule />;
}
