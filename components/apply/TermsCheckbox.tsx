"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface TermsCheckboxProps {
  checked: boolean;
  error?: string;
  onChange: (checked: boolean) => void;
}

/** Terms acceptance control for enrollment. */
export function TermsCheckbox({
  checked,
  error,
  onChange,
}: TermsCheckboxProps) {
  return (
    <div className="space-y-2">
      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-2xl border bg-surface-elevated/90 p-4 transition-colors",
          checked ? "border-honey/40 bg-honey/[0.08]" : "border-navy/10",
          error && !checked && "border-red-300"
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-navy/20 text-honey accent-[var(--honey)]"
        />
        <span className="text-sm leading-relaxed text-navy">
          I agree to Hunarbee&apos;s{" "}
          <Link
            href="#"
            className="font-semibold text-honey-deep underline-offset-2 hover:underline"
            onClick={(e) => e.preventDefault()}
          >
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link
            href="#"
            className="font-semibold text-honey-deep underline-offset-2 hover:underline"
            onClick={(e) => e.preventDefault()}
          >
            Privacy Policy
          </Link>
          .
        </span>
      </label>
      {error ? (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
