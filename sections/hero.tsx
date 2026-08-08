"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandWordmark } from "@/components/shared/brand-wordmark";
import { FadeIn } from "@/components/shared/fade-in";

/** Full-bleed hero with brand-led composition and animated atmosphere. */
export function HeroSection() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden pt-32 sm:pt-36">
      <div className="pointer-events-none absolute inset-0 mesh-glow" aria-hidden />
      <div className="pointer-events-none absolute inset-0 honeycomb-bg opacity-60" aria-hidden />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-[8%] top-[28%] hidden h-16 w-16 rounded-2xl border border-honey/40 md:block"
        animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-[12%] top-[22%] hidden h-10 w-10 rotate-12 rounded-full bg-honey/25 blur-[1px] lg:block"
        animate={{ y: [0, 18, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-[22%] left-[18%] hidden h-3 w-3 rounded-full bg-navy/20 md:block"
        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <HexFloat className="right-[22%] top-[48%] hidden lg:block" delay={0.4} />
      <HexFloat className="left-[6%] bottom-[30%] hidden md:block" delay={1.2} />

      <div className="relative mx-auto grid max-w-[1280px] items-center gap-10 px-5 pb-24 pt-8 sm:px-8 lg:grid-cols-[0.95fr_1.15fr] lg:gap-10 lg:pb-20 lg:pt-12">
        <div>
          <FadeIn>
            <BrandWordmark className="mb-5 block text-4xl sm:text-5xl md:text-6xl" />
          </FadeIn>

          <FadeIn delay={0.08}>
            <h1 className="max-w-xl font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.15] tracking-tight text-navy sm:text-4xl md:text-[2.75rem]">
              Internships that turn ambition into{" "}
              <span className="relative inline-block">
                <span className="relative z-10">career readiness</span>
                <span
                  className="absolute bottom-1 left-0 z-0 h-3 w-full rounded-sm bg-honey/35"
                  aria-hidden
                />
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.16}>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-slate sm:text-lg">
              Build real projects with industry mentors, earn a verifiable
              certificate, and grow a portfolio that hiring managers respect.
            </p>
          </FadeIn>

          <FadeIn delay={0.24}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link href="#apply">
                  Apply for Internship
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="#programs">Explore Programs</Link>
              </Button>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.2} className="relative lg:-mr-4 xl:-mr-8">
          <div className="relative mx-auto w-full max-w-xl lg:max-w-none lg:scale-105 xl:scale-110 lg:origin-left">
            <div className="absolute inset-4 rounded-[28px] bg-gradient-to-br from-honey/25 via-transparent to-navy/10 blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-white/50 shadow-[var(--shadow-lift)] backdrop-blur-sm">
              <Image
                src="/product_visual.png"
                alt="Hunarbee product dashboard preview"
                width={1400}
                height={1050}
                className="h-auto w-full object-cover object-top"
                priority
                sizes="(max-width: 1024px) 95vw, 700px"
              />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function HexFloat({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <motion.svg
      aria-hidden
      className={`pointer-events-none absolute h-12 w-12 text-honey/50 ${className ?? ""}`}
      viewBox="0 0 100 100"
      fill="none"
      animate={{ y: [0, -12, 0], rotate: [0, 12, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <path
        d="M50 12L82 31V69L50 88L18 69V31L50 12Z"
        stroke="currentColor"
        strokeWidth="2.5"
      />
    </motion.svg>
  );
}
