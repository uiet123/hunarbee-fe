"use client";

import { BadgeCheck, ShieldCheck } from "lucide-react";
import { BrandWordmark } from "@/components/shared/brand-wordmark";
import { Section } from "@/components/shared/section";
import { FadeIn } from "@/components/shared/fade-in";

/** Certificate showcase with device mockups and verification badge. */
export function CertificateSection() {
  return (
    <Section
      id="certificate"
      className="honeycomb-bg overflow-hidden"
      eyebrow="Certificate Showcase"
      title="Proof you can verify"
      description="Complete the program and receive a polished, shareable internship certificate with verification built in."
    >
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <FadeIn>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="rounded-t-2xl border border-[var(--border)] bg-navy p-3 shadow-[var(--shadow-lift)]">
              <div className="overflow-hidden rounded-xl bg-white">
                <CertificatePreview />
              </div>
            </div>
            <div className="mx-auto h-3 w-[88%] rounded-b-xl bg-navy-muted" />
            <div className="mx-auto h-2 w-[40%] rounded-b-lg bg-navy/80" />

            <div className="absolute -bottom-6 -right-2 w-[38%] sm:-right-4 sm:w-[34%]">
              <div className="rounded-[1.35rem] border-[3px] border-navy bg-white p-1.5 shadow-[var(--shadow-lift)]">
                <div className="overflow-hidden rounded-[1rem] border border-[var(--border)]">
                  <div className="bg-honey/20 px-2 py-3 text-center">
                    <BrandWordmark className="text-[10px]" />
                  </div>
                  <div className="space-y-2 p-3">
                    <div className="mx-auto h-8 w-8 rounded-full bg-navy/10" />
                    <div className="mx-auto h-1.5 w-16 rounded-full bg-navy/15" />
                    <div className="mx-auto h-1 w-12 rounded-full bg-navy/10" />
                    <div className="mt-2 rounded-lg bg-honey/15 px-2 py-2 text-center text-[7px] font-semibold text-navy">
                      Verified
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.12}>
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-honey/40 bg-honey/10 px-4 py-2 text-sm font-semibold text-navy">
              <BadgeCheck className="h-4 w-4 text-honey-deep" />
              Certificate verification badge
            </div>
            <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-navy sm:text-3xl">
              Shareable. Verifiable. Employer-ready.
            </h3>
            <p className="text-base leading-relaxed text-slate">
              Each certificate includes your track, cohort, and a unique
              verification path so recruiters can confirm authenticity in seconds.
            </p>
            <ul className="space-y-3">
              {[
                "Unique verification ID",
                "Program & project summary",
                "Mentor-signed completion mark",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-navy">
                  <ShieldCheck className="h-5 w-5 text-honey-deep" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

function CertificatePreview() {
  return (
    <div className="relative aspect-[4/3] bg-gradient-to-br from-cream via-white to-honey/10 p-6 sm:p-8">
      <div className="absolute inset-3 rounded-xl border border-honey/30" />
      <div className="relative flex h-full flex-col items-center justify-center text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-honey-deep sm:text-xs">
          Certificate of Internship
        </p>
        <BrandWordmark className="mt-3 block text-xl sm:text-2xl" />
        <div className="my-4 h-px w-24 bg-navy/15" />
        <p className="text-sm text-slate">This certifies that</p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold text-navy">
          Student Name
        </p>
        <p className="mt-3 max-w-xs text-xs leading-relaxed text-slate">
          has successfully completed the Full Stack Development Internship
          Program.
        </p>
        <div className="mt-6 flex w-full max-w-xs items-center justify-between px-2">
          <div className="h-8 w-16 border-t border-navy/20" />
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-honey/25 text-[10px] font-bold text-navy">
            HB
          </div>
          <div className="h-8 w-16 border-t border-navy/20" />
        </div>
      </div>
    </div>
  );
}
