import type { Metadata } from "next";
import { ApplyExperience } from "@/components/apply/ApplyExperience";

export const metadata: Metadata = {
  title: "Apply for Internship",
  description:
    "Start your Hunarbee internship journey — choose your program, duration, and enroll.",
};

/** Internship application / enrollment page (frontend-only). */
export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const programId = typeof params.programId === "string" ? params.programId : undefined;

  return <ApplyExperience programId={programId} />;
}
