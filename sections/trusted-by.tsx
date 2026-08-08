"use client";

import { STATS } from "@/lib/constants";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { FadeIn } from "@/components/shared/fade-in";
import { Section } from "@/components/shared/section";

/** Animated trust metrics strip. */
export function TrustedBySection() {
  return (
    <Section
      id="trusted"
      className="border-y border-[var(--border)] bg-cream/40 py-16 md:py-20"
    >
      <FadeIn>
        <div className="mb-10 flex items-center justify-center gap-3">
          <span className="hidden h-px w-8 bg-honey-deep/35 sm:block" aria-hidden />
          <span className="inline-flex items-center gap-2.5 font-[family-name:var(--font-display)] text-base font-semibold tracking-[0.06em] text-honey-deep sm:text-lg">
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
            Trusted by ambitious students & mentors
          </span>
          <span className="hidden h-px w-8 bg-honey-deep/35 sm:block" aria-hidden />
        </div>
      </FadeIn>
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-4">
        {STATS.map((stat) => (
          <AnimatedCounter
            key={stat.label}
            end={stat.value}
            suffix={stat.suffix}
            label={stat.label}
          />
        ))}
      </div>
    </Section>
  );
}
