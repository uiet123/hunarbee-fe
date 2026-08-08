"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Briefcase,
  Compass,
  FolderKanban,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/fade-in";
import { ApplicationHeader } from "@/components/apply/ApplicationHeader";
import { PersonalDetails } from "@/components/apply/PersonalDetails";
import { ProgramSelector } from "@/components/apply/ProgramSelector";
import { DurationSelector } from "@/components/apply/DurationSelector";
import { OrderSummary } from "@/components/apply/OrderSummary";
import { TermsCheckbox } from "@/components/apply/TermsCheckbox";
import {
  APPLY_BENEFITS,
  INITIAL_APPLICATION_FORM,
  isApplicationFormComplete,
  validateApplicationForm,
  type ApplicationFormData,
  type ApplicationFormErrors,
} from "@/lib/apply";

const BENEFIT_ICONS = [Briefcase, Compass, Award, FolderKanban] as const;

/** Full frontend internship application experience. */
export function ApplyExperience() {
  const router = useRouter();
  const [form, setForm] = useState<ApplicationFormData>(INITIAL_APPLICATION_FORM);
  const [errors, setErrors] = useState<ApplicationFormErrors>({});
  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [readyForPayment, setReadyForPayment] = useState(false);

  const update = <K extends keyof ApplicationFormData>(
    key: K,
    value: ApplicationFormData[K]
  ) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (showErrors) {
        setErrors(validateApplicationForm(next));
      }
      return next;
    });
  };

  const canContinue = useMemo(() => isApplicationFormComplete(form), [form]);

  const handleContinue = async () => {
    const nextErrors = validateApplicationForm(form);
    setShowErrors(true);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstKey = Object.keys(nextErrors)[0];
      document
        .getElementById(firstKey === "programId" ? "programs-section" : firstKey)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setLoading(false);
    setReadyForPayment(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen pb-16">
      <ApplicationHeader />

      <div className="relative mx-auto max-w-[1280px] px-5 py-10 sm:px-8 sm:py-14">
        <AnimatePresence mode="wait">
          {readyForPayment ? (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto max-w-xl"
            >
              <div className="rounded-2xl border border-[var(--border)] bg-surface-elevated/95 p-8 text-center shadow-[var(--shadow-lift)] sm:p-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-honey/20 text-honey-deep">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h2 className="mt-6 font-[family-name:var(--font-display)] text-2xl font-bold text-navy sm:text-3xl">
                  You&apos;re almost there!
                </h2>
                <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-slate">
                  Review your details and continue to secure your internship
                  enrollment.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button
                    size="lg"
                    className="text-base"
                    onClick={() => router.push("/apply/payment")}
                  >
                    Proceed to Payment
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-base"
                    onClick={() => setReadyForPayment(false)}
                  >
                    Edit application
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="grid gap-8 lg:grid-cols-[minmax(240px,0.85fr)_minmax(0,1.2fr)] lg:items-start lg:gap-8"
            >
              {/* Left — benefits / application info */}
              <FadeIn className="lg:sticky lg:top-32">
                <BenefitsPanel />
              </FadeIn>

              {/* Registration form + order summary stacked */}
              <div className="space-y-6 lg:space-y-8">
                <FadeIn className="relative z-20 overflow-visible">
                  <div className="relative z-20 overflow-visible rounded-2xl border border-[var(--border)] bg-surface-elevated/95 p-5 shadow-[var(--shadow-soft)] backdrop-blur-sm sm:p-7">
                    <PersonalDetails
                      data={form}
                      errors={errors}
                      onChange={update}
                    />
                  </div>
                </FadeIn>

                <FadeIn delay={0.05}>
                  <div
                    id="programs-section"
                    className="rounded-2xl border border-[var(--border)] bg-surface-elevated/95 p-5 shadow-[var(--shadow-soft)] backdrop-blur-sm sm:p-7"
                  >
                    <ProgramSelector
                      value={form.programId}
                      error={errors.programId}
                      onChange={(id) => update("programId", id)}
                    />
                  </div>
                </FadeIn>

                <FadeIn delay={0.08}>
                  <div className="rounded-2xl border border-[var(--border)] bg-surface-elevated/95 p-5 shadow-[var(--shadow-soft)] backdrop-blur-sm sm:p-7">
                    <DurationSelector
                      value={form.durationId}
                      error={errors.durationId}
                      onChange={(id) => update("durationId", id)}
                    />
                  </div>
                </FadeIn>

                <FadeIn delay={0.1}>
                  <TermsCheckbox
                    checked={form.termsAccepted}
                    error={errors.termsAccepted}
                    onChange={(checked) => update("termsAccepted", checked)}
                  />
                </FadeIn>

                <OrderSummary
                  data={form}
                  canContinue={canContinue}
                  loading={loading}
                  onContinue={handleContinue}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function BenefitsPanel() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-navy/10 bg-navy p-6 text-white shadow-[var(--shadow-lift)] sm:p-7">
      <div className="pointer-events-none absolute inset-0 honeycomb-bg opacity-30" aria-hidden />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-honey">
          Why apply with Hunarbee
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
          Built for students who want proof, not just promises.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/65">
          Your application unlocks mentored projects, a structured internship
          path, and a certificate employers can verify.
        </p>

        <ul className="mt-8 space-y-5">
          {APPLY_BENEFITS.map((benefit, index) => {
            const Icon = BENEFIT_ICONS[index];
            return (
              <li key={benefit.title} className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-honey/15 text-honey">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {benefit.title}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-white/60">
                    {benefit.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
