"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  getPlanById,
  getProgramById,
  validateApplicationForm,
  type ApplicationFormData,
  type ApplicationFormErrors,
  type DurationPlanId,
} from "@/lib/apply";
import { ApiError, createPaymentOrder, fetchPricing, waitForPaymentSettlement } from "@/lib/api";
import { openRazorpayCheckout } from "@/lib/razorpay";
import { detectUserCountry } from "@/lib/geo";
import { getCountryName, toE164Phone } from "@/lib/phone";
import {
  formatMoney,
  getCurrencyForCountryIso,
  type PricingCurrency,
} from "@/lib/pricing";

const BENEFIT_ICONS = [Briefcase, Compass, Award, FolderKanban] as const;

type PaymentStatus = "idle" | "paid";

/** Full frontend internship application experience with Razorpay checkout. */
export function ApplyExperience() {
  const [form, setForm] = useState<ApplicationFormData>(INITIAL_APPLICATION_FORM);
  const [errors, setErrors] = useState<ApplicationFormErrors>({});
  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [preferredCurrency, setPreferredCurrency] =
    useState<PricingCurrency>("INR");
  const [currency, setCurrency] = useState<PricingCurrency>("INR");
  const [pricingSource, setPricingSource] = useState<"live" | "fallback">(
    "live"
  );
  const [countryName, setCountryName] = useState("India");
  const [planPrices, setPlanPrices] = useState<Record<
    DurationPlanId,
    number
  > | null>(null);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [paidReceipt, setPaidReceipt] = useState<{
    paymentId: string;
    amountMajor: number;
    currency: PricingCurrency;
    programTitle: string;
    planLabel: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    detectUserCountry().then((location) => {
      if (cancelled) return;

      setCountryName(location.countryName);
      const nextCurrency = getCurrencyForCountryIso(location.countryIso);
      setPreferredCurrency(nextCurrency);
      setCurrency(nextCurrency);

      setForm((prev) => ({
        ...prev,
        countryIso: location.countryIso || prev.countryIso,
      }));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setPricingLoading(true);
    setPricingError(null);
    setPlanPrices(null);

    fetchPricing(preferredCurrency)
      .then((pricing) => {
        if (cancelled) return;
        const nextCurrency = (pricing.currency as PricingCurrency) || preferredCurrency;
        setPlanPrices(pricing.plans);
        setCurrency(nextCurrency);
        setPricingSource(pricing.source);
        setPricingError(null);
      })
      .catch((error) => {
        if (cancelled) return;
        setPlanPrices(null);
        setPricingSource("fallback");
        setPricingError(
          error instanceof ApiError
            ? error.message
            : "Unable to load live prices. Please try again."
        );
      })
      .finally(() => {
        if (!cancelled) setPricingLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [preferredCurrency]);

  const update = <K extends keyof ApplicationFormData>(
    key: K,
    value: ApplicationFormData[K]
  ) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "countryIso" && typeof value === "string") {
        const nextCurrency = getCurrencyForCountryIso(value);
        setPreferredCurrency(nextCurrency);
        setCurrency(nextCurrency);
        setCountryName(getCountryName(value));
        // Reset number so dial code matches the new country cleanly
        next.phone = "";
      }

      if (showErrors) {
        setErrors(validateApplicationForm(next));
      }
      return next;
    });
  };

  const handleContinue = async () => {
    const nextErrors = validateApplicationForm(form);
    setShowErrors(true);
    setErrors(nextErrors);
    setPaymentError(null);

    if (Object.keys(nextErrors).length > 0) {
      const firstKey = Object.keys(nextErrors)[0];
      document
        .getElementById(firstKey === "programId" ? "programs-section" : firstKey)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const plan = getPlanById(form.durationId);
    const program = getProgramById(form.programId);
    if (!plan || !program || !form.programId || !form.durationId) {
      setPaymentError("Please select a program and duration.");
      return;
    }

    if (!planPrices) {
      setPaymentError(
        pricingError || "Live prices are still loading. Please wait a moment."
      );
      return;
    }

    setLoading(true);

    const contact = toE164Phone(form.phone);

    try {
      const order = await createPaymentOrder({
        durationId: form.durationId,
        currency,
        programId: form.programId,
        applicantName: form.fullName.trim(),
        applicantEmail: form.email.trim(),
        applicantPhone: contact,
        countryIso: form.countryIso,
        occupation: form.occupation,
        preferredBatch: form.preferredBatch,
      });

      await openRazorpayCheckout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Hunarbee",
        description: `${program.title} · ${plan.label}`,
        order_id: order.orderId,
        ...(order.customerId ? { customer_id: order.customerId } : {}),
        prefill: {
          name: form.fullName.trim(),
          email: form.email.trim(),
          contact: order.contact || contact,
        },
        readonly: {
          name: true,
          email: true,
          contact: true,
        },
        notes: {
          programId: form.programId,
          durationId: form.durationId,
          preferredBatch: form.preferredBatch,
          currency,
          countryIso: form.countryIso,
          phone: contact,
        },
        theme: { color: "#f5b800" },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setPaymentError("Payment was cancelled. You can try again anytime.");
          },
        },
        handler: async (response) => {
          try {
            const settled = await waitForPaymentSettlement(
              response.razorpay_order_id
            );

            if (settled.status === "failed") {
              setPaymentError("Payment failed. Please try again.");
              return;
            }

            setPaidReceipt({
              paymentId:
                settled.paymentId || response.razorpay_payment_id,
              amountMajor: settled.amountMajor,
              currency: (settled.currency as PricingCurrency) || currency,
              programTitle: program.title,
              planLabel: plan.label,
            });
            setPaymentStatus("paid");
            setPaymentError(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          } catch (error) {
            setPaymentError(
              error instanceof ApiError
                ? error.message
                : "Payment received but confirmation is pending. Contact support if enrollment does not appear."
            );
          } finally {
            setLoading(false);
          }
        },
      });
    } catch (error) {
      setLoading(false);
      setPaymentError(
        error instanceof ApiError
          ? error.message
          : "Unable to start payment. Please try again."
      );
    }
  };

  return (
    <div className="relative min-h-screen pb-16">
      <ApplicationHeader />

      <div className="relative mx-auto max-w-[1280px] px-5 py-10 sm:px-8 sm:py-14">
        <AnimatePresence mode="wait">
          {paymentStatus === "paid" && paidReceipt ? (
            <motion.div
              key="paid"
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
                  Congratulations!
                </h2>
                <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-slate">
                  Your internship enrollment for{" "}
                  <span className="font-semibold text-navy">
                    {paidReceipt.programTitle}
                  </span>{" "}
                  ({paidReceipt.planLabel}) is confirmed.
                </p>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate">
                  Further details — your offer letter and learning portal login
                  (ID, password, and link) — will be sent to your email shortly.
                </p>

                <div className="mx-auto mt-6 max-w-sm space-y-2 rounded-2xl border border-navy/10 bg-surface px-4 py-4 text-left text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate">Amount paid</span>
                    <span className="font-semibold text-navy">
                      {formatMoney(paidReceipt.amountMajor, paidReceipt.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate">Payment ID</span>
                    <span className="break-all font-semibold text-navy">
                      {paidReceipt.paymentId}
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button size="lg" className="text-base" asChild>
                    <Link href="/">
                      Back to Home
                      <ArrowRight className="h-4 w-4" />
                    </Link>
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
              <FadeIn className="lg:sticky lg:top-32">
                <BenefitsPanel />
              </FadeIn>

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
                      currency={currency}
                      countryName={countryName}
                      planPrices={planPrices}
                      pricingLoading={pricingLoading}
                      pricingError={pricingError}
                      pricingSource={pricingSource}
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

                {paymentError ? (
                  <p
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                    role="alert"
                  >
                    {paymentError}
                  </p>
                ) : null}

                <OrderSummary
                  data={form}
                  currency={currency}
                  planPrices={planPrices}
                  pricingLoading={pricingLoading}
                  pricingSource={pricingSource}
                  loading={loading || pricingLoading || !planPrices}
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
