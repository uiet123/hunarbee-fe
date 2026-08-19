"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import {
  DURATION_PLANS,
  type DurationPlanId,
} from "@/lib/apply";
import {
  formatMoney,
  getPricingLabel,
  type PricingCurrency,
} from "@/lib/pricing";
import { cn } from "@/lib/utils";

interface DurationSelectorProps {
  value: string | null;
  currency: PricingCurrency;
  planPrices: Record<string, number> | null;
  rateFromInr?: number | null;
  countryName?: string;
  pricingLoading?: boolean;
  pricingError?: string | null;
  pricingSource?: "live" | "fallback";
  error?: string;
  onChange: (id: string) => void;
  dbPlans?: any[];
}

/** Single-select pricing / duration plans with live FX from API. */
export function DurationSelector({
  value,
  currency,
  planPrices,
  rateFromInr,
  countryName,
  pricingLoading = false,
  pricingError = null,
  pricingSource = "live",
  error,
  onChange,
  dbPlans,
}: DurationSelectorProps) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-navy">
          Choose Your Duration
        </h2>
        <p className="mt-1 text-sm text-slate">
          Pick the plan that matches your learning pace.{" "}
          <span className="font-medium text-navy">
            {pricingSource === "fallback"
              ? `USD fallback${countryName ? ` · ${countryName}` : ""}`
              : getPricingLabel(currency, countryName)}
          </span>
        </p>
      </div>

      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        role="radiogroup"
        aria-label="Duration plan"
      >
        {(!dbPlans || dbPlans.length === 0) && (
          <div className="col-span-full rounded-2xl border border-dashed border-navy/20 bg-surface-elevated/50 p-8 text-center">
            <p className="text-sm font-semibold text-navy">No Plans Available</p>
            <p className="text-xs text-slate mt-1">This program currently has no duration plans available.</p>
          </div>
        )}
        {dbPlans?.map((plan, index) => {
          const selected = value === plan.id;
          
          const baseInr = plan.price / 100;
          const localPrice = currency === "INR" ? baseInr : Math.ceil(baseInr * (rateFromInr || 1));
          
          const label = plan.duration_months ? `${plan.duration_months} Month${plan.duration_months > 1 ? 's' : ''}` : plan.name;
          const isRecommended = index === (dbPlans.length > 1 ? 1 : 0);

          return (
            <motion.button
              key={plan.id}
              type="button"
              role="radio"
              aria-checked={selected}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onChange(plan.id)}
              disabled={pricingLoading}
              className={cn(
                "relative flex h-full flex-col rounded-2xl border bg-surface-elevated/95 p-5 text-left shadow-[var(--shadow-soft)] transition-[border-color,box-shadow] duration-300",
                selected
                  ? "border-honey/55 shadow-[0_16px_40px_rgba(245,184,0,0.18)]"
                  : "border-navy/10 hover:border-honey/35 hover:shadow-[var(--shadow-lift)]",
                error && !value && "border-red-300",
                (pricingLoading || typeof localPrice !== "number") && "opacity-70"
              )}
            >
              {isRecommended ? (
                <span className="absolute -top-2.5 right-4 rounded-full bg-honey px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-navy shadow-[0_4px_12px_rgba(245,184,0,0.35)]">
                  Recommended
                </span>
              ) : null}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-[family-name:var(--font-display)] text-lg font-bold text-navy">
                    {label}
                  </p>
                  <p
                    className={cn(
                      "mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-navy transition-opacity",
                      pricingLoading && "opacity-60"
                    )}
                  >
                    {typeof localPrice === "number"
                      ? formatMoney(localPrice, currency)
                      : pricingLoading
                        ? "…"
                        : "—"}
                  </p>
                </div>
                <span
                  className={cn(
                    "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                    selected
                      ? "border-honey bg-honey text-navy"
                      : "border-navy/20 bg-surface text-transparent"
                  )}
                  aria-hidden
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {pricingError ? (
        <p className="text-xs font-medium text-red-600" role="alert">
          {pricingError}
        </p>
      ) : null}

      {error ? (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
