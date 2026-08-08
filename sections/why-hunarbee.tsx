"use client";

import {
  Award,
  Briefcase,
  Compass,
  FolderKanban,
  Laptop,
  Users,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { WHY_FEATURES } from "@/lib/constants";
import { Section } from "@/components/shared/section";
import { Stagger, StaggerItem } from "@/components/shared/fade-in";

const ICONS: Record<string, LucideIcon> = {
  Briefcase,
  Users,
  Award,
  FolderKanban,
  Compass,
  Laptop,
};

/** Soft alternating washes — honey & light blue. */
const WHY_CARD_BGS = [
  "bg-gradient-to-br from-[#fff8e6] via-[#fffbf0] to-[#ffe8a8]",
  "bg-gradient-to-br from-[#e8f0fb] via-[#f2f6fc] to-[#d5e4f7]",
] as const;

/** Feature grid explaining Hunarbee's value props. */
export function WhyHunarbeeSection() {
  return (
    <Section
      id="why"
      className="honeycomb-bg"
      eyebrow="Why Hunarbee"
      title="Built for outcomes, not busywork"
      description="Every part of the experience is designed to make you hireable—real work, real feedback, real proof."
    >
      <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {WHY_FEATURES.map((feature, index) => {
          const Icon = ICONS[feature.icon] ?? Briefcase;
          return (
            <StaggerItem key={feature.title}>
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className={`group relative h-full overflow-hidden rounded-2xl border-2 border-navy/10 p-6 shadow-[0_10px_30px_rgba(11,18,32,0.06)] transition-[border-color,box-shadow,transform] duration-300 hover:border-honey/55 hover:shadow-[0_20px_44px_rgba(245,184,0,0.18)] sm:p-7 ${WHY_CARD_BGS[index % 2]}`}
              >
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-honey/20 blur-2xl transition-opacity duration-300 group-hover:opacity-80"
                  aria-hidden
                />
                <div
                  className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-honey via-honey-deep to-honey transition-transform duration-300 group-hover:scale-x-100"
                  aria-hidden
                />

                <div className="relative mb-5 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-navy shadow-[0_4px_14px_rgba(11,18,32,0.06)] ring-1 ring-honey/30 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105 group-hover:bg-honey/25 group-hover:shadow-[0_8px_20px_rgba(245,184,0,0.28)]">
                    <Icon className="h-5 w-5" strokeWidth={1.85} />
                  </div>
                  <span className="font-[family-name:var(--font-display)] text-xs font-semibold tracking-wider text-navy/30">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="relative font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-navy sm:text-xl">
                  {feature.title}
                </h3>
                <p className="relative mt-2.5 text-sm leading-relaxed text-slate sm:text-[15px]">
                  {feature.description}
                </p>

                <svg
                  className="pointer-events-none absolute -bottom-3 -right-3 h-16 w-16 text-navy/10 transition-colors duration-300 group-hover:text-honey/40"
                  viewBox="0 0 100 100"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M50 12L82 31V69L50 88L18 69V31L50 12Z"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                </svg>
              </motion.article>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}
