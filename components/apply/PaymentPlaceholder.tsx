"use client";

import Link from "next/link";
import { ArrowLeft, CreditCard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/fade-in";

/** Placeholder payment step — gateway integration comes later. */
export function PaymentPlaceholder() {
  return (
    <div className="relative min-h-[80vh] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 mesh-glow opacity-70" aria-hidden />
      <div className="pointer-events-none absolute inset-0 honeycomb-bg opacity-45" aria-hidden />

      <div className="relative mx-auto flex max-w-xl flex-col px-5 pb-20 pt-32 sm:px-8 sm:pt-36">
        <FadeIn>
          <div className="rounded-2xl border border-[var(--border)] bg-surface-elevated/95 p-8 text-center shadow-[var(--shadow-lift)] backdrop-blur-sm sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-honey">
              <CreditCard className="h-6 w-6" />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-honey-deep">
              Step 3 · Payment
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-navy sm:text-3xl">
              Payment coming soon
            </h1>
            <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-slate">
              You&apos;re almost there! Secure checkout will be available here
              shortly. No payment is collected on this page yet.
            </p>

            <div className="mx-auto mt-8 flex max-w-sm items-start gap-3 rounded-2xl border border-honey/30 bg-honey/[0.08] p-4 text-left">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-honey-deep" />
              <p className="text-sm leading-relaxed text-navy">
                Review your details and continue to secure your internship
                enrollment once payment opens.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/apply">
                  <ArrowLeft className="h-4 w-4" />
                  Back to application
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/">Go to Home</Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
