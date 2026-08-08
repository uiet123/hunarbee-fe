import { HeroSection } from "@/sections/hero";
import { TrustedBySection } from "@/sections/trusted-by";
import { WhyHunarbeeSection } from "@/sections/why-hunarbee";
import { ProgramsSection } from "@/sections/programs";
import { LearningProcessSection } from "@/sections/learning-process";
import { TestimonialsSection } from "@/sections/testimonials";
import { CertificateSection } from "@/sections/certificate";
import { CommunitySection } from "@/sections/community";
import { FaqSection } from "@/sections/faq";
import { CtaSection } from "@/sections/cta";

/** Hunarbee marketing landing page — server component shell. */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustedBySection />
      <WhyHunarbeeSection />
      <ProgramsSection />
      <LearningProcessSection />
      <TestimonialsSection />
      <CertificateSection />
      <CommunitySection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
