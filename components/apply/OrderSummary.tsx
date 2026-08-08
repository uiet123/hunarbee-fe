"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatInr,
  getPlanById,
  getProgramById,
  type ApplicationFormData,
} from "@/lib/apply";
import { cn } from "@/lib/utils";

interface OrderSummaryProps {
  data: ApplicationFormData;
  canContinue: boolean;
  loading?: boolean;
  onContinue: () => void;
  className?: string;
}

/** Sticky enrollment order summary with dynamic pricing. */
export function OrderSummary({
  data,
  canContinue,
  loading = false,
  onContinue,
  className,
}: OrderSummaryProps) {
  const program = getProgramById(data.programId);
  const plan = getPlanById(data.durationId);
  const total = plan?.priceInr ?? 0;

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
              {plan?.label ?? "Select a plan"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate">Internship Fee</p>
          <p className="text-sm font-semibold text-navy">
            {plan ? formatInr(plan.priceInr) : "—"}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate">
            Total
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-navy">
            {plan ? formatInr(total) : "₹0"}
          </p>
        </div>
      </div>

      <Button
        type="button"
        size="lg"
        className="mt-6 w-full text-base"
        disabled={!canContinue || loading}
        onClick={onContinue}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Validating…
          </>
        ) : (
          "Continue to Payment →"
        )}
      </Button>

      <p className="mt-3 text-center text-xs leading-relaxed text-slate">
        Payment gateway comes next. No charge is taken on this step.
      </p>
    </aside>
  );
}
