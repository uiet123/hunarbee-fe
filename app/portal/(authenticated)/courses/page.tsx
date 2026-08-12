import type { Metadata } from "next";
import { PortalCourses } from "@/components/portal/PortalCourses";

export const metadata: Metadata = {
  title: "My Courses",
  description: "View your enrolled courses and track progress.",
};

export default function CoursesPage() {
  return <PortalCourses />;
}
