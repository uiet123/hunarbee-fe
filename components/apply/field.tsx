"use client";

import { cn } from "@/lib/utils";

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
  hint?: string;
}

/** Shared labeled field shell for the apply form. */
export function Field({
  id,
  label,
  required,
  error,
  children,
  className,
  hint,
}: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-navy"
      >
        {label}
        {required ? <span className="ml-1 text-honey-deep">*</span> : null}
        {!required ? (
          <span className="ml-2 text-xs font-medium text-slate/70">Optional</span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p className="text-xs text-slate">{hint}</p>
      ) : null}
      {error ? (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputClassName =
  "w-full rounded-2xl border-2 border-navy/20 bg-surface px-4 py-3 text-sm text-navy shadow-[0_1px_2px_rgba(11,18,32,0.04)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-slate/50 hover:border-navy/30 focus:border-honey focus:bg-surface-elevated focus:ring-4 focus:ring-honey/20";
