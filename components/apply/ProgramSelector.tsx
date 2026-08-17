"use client";

import { Check, Layers, Monitor, Server } from "lucide-react";
import { motion } from "framer-motion";
import {
  APPLY_PROGRAMS,
  type ApplicationFormErrors,
  type InternshipProgramId,
} from "@/lib/apply";
import { cn } from "@/lib/utils";

const ICONS = {
  Monitor,
  Server,
  Layers,
} as const;

interface ProgramSelectorProps {
  value: InternshipProgramId | string | null;
  error?: string;
  onChange: (id: string) => void;
  lockedProgram?: any;
  loading?: boolean;
}

/** Single-select premium internship program cards. */
export function ProgramSelector({
  value,
  error,
  onChange,
  lockedProgram,
  loading,
}: ProgramSelectorProps) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-navy">
          Choose Your Internship
        </h2>
        <p className="mt-1 text-sm text-slate">
          Select one track. You can change this before payment.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-1" role="radiogroup" aria-label="Internship program">
        {loading ? (
           <div className="animate-pulse rounded-2xl border border-navy/10 bg-surface-elevated/95 p-5 h-24" />
        ) : lockedProgram ? (
          <motion.div
            key={lockedProgram.id}
            role="radio"
            aria-checked={true}
            className="group relative flex w-full items-start gap-4 rounded-2xl border border-honey/55 bg-honey/[0.1] shadow-[0_12px_32px_rgba(245,184,0,0.16)] p-4 text-left sm:p-5"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-honey text-navy">
              <Monitor className="h-5 w-5" strokeWidth={2} />
            </div>

            <div className="min-w-0 flex-1 pr-8">
              <p className="font-[family-name:var(--font-display)] text-base font-bold text-navy">
                {lockedProgram.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate">
                {lockedProgram.description}
              </p>
            </div>

            <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border border-honey bg-honey text-navy" aria-hidden>
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
          </motion.div>
        ) : APPLY_PROGRAMS.map((program) => {
          const selected = value === program.id;
          const Icon = ICONS[program.icon];

          return (
            <motion.button
              key={program.id}
              type="button"
              role="radio"
              aria-checked={selected}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.995 }}
              onClick={() => onChange(program.id)}
              className={cn(
                "group relative flex w-full items-start gap-4 rounded-2xl border bg-surface-elevated/95 p-4 text-left shadow-[var(--shadow-soft)] transition-[border-color,box-shadow,background-color] duration-300 sm:p-5",
                selected
                  ? "border-honey/55 bg-honey/[0.1] shadow-[0_12px_32px_rgba(245,184,0,0.16)]"
                  : "border-navy/10 hover:border-honey/35 hover:shadow-[var(--shadow-lift)]",
                error && !value && "border-red-300"
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300",
                  selected
                    ? "bg-honey text-navy"
                    : "bg-navy/[0.05] text-navy group-hover:bg-honey/20"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>

              <div className="min-w-0 flex-1 pr-8">
                <p className="font-[family-name:var(--font-display)] text-base font-bold text-navy">
                  {program.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate">
                  {program.description}
                </p>
              </div>

              <span
                className={cn(
                  "absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border transition-colors",
                  selected
                    ? "border-honey bg-honey text-navy"
                    : "border-navy/20 bg-surface text-transparent"
                )}
                aria-hidden
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            </motion.button>
          );
        })}
      </div>

      {error ? (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
