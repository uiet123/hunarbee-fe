"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/fade-in";

/** Final conversion CTA band. */
export function CtaSection() {
  return (
    <section id="apply" className="relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-navy" aria-hidden />
      <div className="pointer-events-none absolute inset-0 cta-glow opacity-40" aria-hidden />
      <div className="pointer-events-none absolute inset-0 honeycomb-bg opacity-30" aria-hidden />

      <div className="relative mx-auto max-w-[1280px] px-5 text-center sm:px-8">
        <FadeIn>
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="hidden h-px w-8 bg-honey/40 sm:block" aria-hidden />
            <span className="inline-flex items-center gap-2.5 font-[family-name:var(--font-display)] text-base font-semibold tracking-[0.06em] text-honey sm:text-lg">
              <svg
                className="h-4 w-4 shrink-0 sm:h-[1.125rem] sm:w-[1.125rem]"
                viewBox="0 0 100 100"
                fill="none"
                aria-hidden
              >
                <path
                  d="M50 12L82 31V69L50 88L18 69V31L50 12Z"
                  stroke="currentColor"
                  strokeWidth="8"
                />
              </svg>
              Ready when you are
            </span>
            <span className="hidden h-px w-8 bg-honey/40 sm:block" aria-hidden />
          </div>
          <h2 className="mx-auto max-w-2xl font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl md:leading-[1.15]">
            Ready to start your career?
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/65 sm:text-lg">
            Apply to Hunarbee, join a mentored cohort, and build the portfolio that
            opens doors.
          </p>
          <div className="mt-10">
            <Button size="xl" asChild>
              <Link href="/apply">
                Apply Now
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
