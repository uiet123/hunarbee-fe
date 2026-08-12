import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Portal",
  description: "Sign in to your Hunarbee internship workspace.",
};

/** Portal routes use their own chrome — marketing header/footer are hidden. */
export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
