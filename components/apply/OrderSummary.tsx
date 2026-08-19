"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPlanById,
  getProgramById,
  type ApplicationFormData,
  type DurationPlanId,
} from "@/lib/apply";
import { formatMoney, type PricingCurrency } from "@/lib/pricing";
import { cn } from "@/lib/utils";

interface OrderSummaryProps {
  data: ApplicationFormData;
  currency: PricingCurrency;
  planPrices: Record<string, number> | null;
  pricingLoading?: boolean;
  pricingSource?: "live" | "fallback";
  loading?: boolean;
  onContinue: () => void;
  className?: string;
  dbProgram?: any;
  dbPlans?: any[];
  rateFromInr?: number | null;
}

/** Sticky enrollment order summary with live FX pricing from API. */
export function OrderSummary({
  data,
  currency,
  planPrices,
  pricingLoading = false,
  pricingSource = "live",
  loading = false,
  onContinue,
  className,
  dbProgram,
  dbPlans,
  rateFromInr,
}: OrderSummaryProps) {
  const program = dbProgram || getProgramById(data.programId);
  const plan = dbPlans?.find(p => p.id === data.durationId);
  
  let localTotal: number | null = null;
  if (plan) {
    const baseInr = plan.price / 100;
    localTotal = currency === "INR" ? baseInr : Math.ceil(baseInr * (rateFromInr || 1));
  }

  return (
    <aside
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-surface-elevated/95 p-6 shadow-[var(--shadow-lift)] backdrop-blur-sm",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-honey-deep">
        Order summary
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold text-navy">
        Your Internship
      </h2>

      <div className="mt-6 space-y-4 border-y border-[var(--border)] py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate">
              Program
            </p>
            <p className="mt-1 text-sm font-semibold text-navy">
              {program?.title ?? "Select a program"}
            </p>
          </div>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate">
              Duration
            </p>
            <p className="mt-1 text-sm font-semibold text-navy">
              {plan ? (plan.duration_months ? `${plan.duration_months} Months` : plan.label || plan.name) : "Select a plan"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate">Internship Fee</p>
          <p className="text-sm font-semibold text-navy">
            {typeof localTotal === "number"
              ? formatMoney(localTotal, currency)
              : pricingLoading
                ? "…"
                : "—"}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate">
            Total
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-navy">
            {typeof localTotal === "number"
              ? formatMoney(localTotal, currency)
              : pricingLoading
                ? "…"
                : "—"}
          </p>
        </div>
      </div>

      <Button
        type="button"
        size="lg"
        className="mt-6 w-full text-base"
        disabled={loading || !plan}
        onClick={onContinue}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {pricingLoading
              ? "Loading live prices…"
              : "Confirming payment…"}
          </>
        ) : (
          "Continue to Payment →"
        )}
      </Button>

      <p className="mt-3 text-center text-xs leading-relaxed text-slate">
        {currency === "INR"
          ? "Secure checkout via Razorpay · INR"
          : pricingSource === "fallback"
            ? "Exchange rate unavailable · charged in USD"
            : `Live FX from ExchangeRate-API · charged in ${currency}`}
      </p>
    </aside>
  );
}
