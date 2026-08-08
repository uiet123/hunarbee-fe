"use client";

import { PROCESS_STEPS } from "@/lib/constants";
import { Section } from "@/components/shared/section";
import { FadeIn, Stagger, StaggerItem } from "@/components/shared/fade-in";

/** Animated vertical learning / internship process timeline. */
export function LearningProcessSection() {
  return (
    <Section
      id="process"
      eyebrow="Learning Process"
      title="From application to placement support"
      description="A clear path with milestones you can see—and mentors who keep you accountable."
    >
      <div className="relative mx-auto max-w-2xl">
        <div
          className="absolute left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-honey via-navy/15 to-honey/40 sm:left-1/2 sm:-translate-x-px"
          aria-hidden
        />

        <Stagger className="space-y-8" stagger={0.1}>
          {PROCESS_STEPS.map((step, index) => {
            const isLeft = index % 2 === 0;
            return (
              <StaggerItem key={step.title}>
                <div
                  className={`relative flex gap-6 sm:items-center ${
                    isLeft ? "sm:flex-row" : "sm:flex-row-reverse"
                  }`}
                >
                  <div
                    className={`hidden flex-1 sm:block ${
                      isLeft ? "text-right" : "text-left"
                    }`}
                  >
                    <FadeIn delay={0.05}>
                      <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-navy">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate">
                        {step.description}
                      </p>
                    </FadeIn>
                  </div>

                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-honey bg-white text-sm font-bold text-navy shadow-[0_0_0_6px_rgba(245,184,0,0.12)]">
                    {index + 1}
                  </div>

                  <div className="flex-1 pt-1 sm:pt-0">
                    <div className="sm:hidden">
                      <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-navy">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate">
                        {step.description}
                      </p>
                    </div>
                    <div className="hidden sm:block" aria-hidden />
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </Section>
  );
}
