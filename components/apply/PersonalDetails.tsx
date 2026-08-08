"use client";

import { useMemo } from "react";
import {
  INDIAN_STATES,
  OCCUPATIONS,
  formatBatchLabel,
  getTomorrowBatchOption,
  type ApplicationFormData,
  type ApplicationFormErrors,
} from "@/lib/apply";
import { Field, inputClassName } from "./field";
import { SelectDropdown } from "./SelectDropdown";
import { cn } from "@/lib/utils";

interface PersonalDetailsProps {
  data: ApplicationFormData;
  errors: ApplicationFormErrors;
  onChange: <K extends keyof ApplicationFormData>(
    key: K,
    value: ApplicationFormData[K]
  ) => void;
}

/** Personal details inputs for internship application. */
export function PersonalDetails({ data, errors, onChange }: PersonalDetailsProps) {
  const tomorrowBatch = useMemo(() => getTomorrowBatchOption(), []);

  const occupationOptions = useMemo(
    () => OCCUPATIONS.map((item) => ({ value: item.value, label: item.label })),
    []
  );

  const stateOptions = useMemo(
    () => INDIAN_STATES.map((state) => ({ value: state, label: state })),
    []
  );

  const batchOptions = useMemo(
    () => [
      {
        value: tomorrowBatch.value,
        label: formatBatchLabel(tomorrowBatch.value),
      },
    ],
    [tomorrowBatch.value]
  );

  return (
    <section className="space-y-5 overflow-visible">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-navy">
          Personal Details
        </h2>
        <p className="mt-1 text-sm text-slate">
          Tell us who you are so we can set up your internship profile.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="fullName"
          label="Full Name"
          required
          error={errors.fullName}
          className="sm:col-span-2"
        >
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Enter your full name"
            value={data.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            className={cn(inputClassName, errors.fullName && "border-red-400")}
          />
        </Field>

        <Field id="email" label="Email Address" required error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
            className={cn(inputClassName, errors.email && "border-red-400")}
          />
        </Field>

        <Field id="phone" label="Phone Number" required error={errors.phone}>
          <div
            className={cn(
              "flex overflow-hidden rounded-2xl border-2 border-navy/20 bg-surface shadow-[0_1px_2px_rgba(11,18,32,0.04)] transition-[border-color,box-shadow] duration-200 focus-within:border-honey focus-within:bg-surface-elevated focus-within:ring-4 focus-within:ring-honey/20",
              errors.phone && "border-red-400"
            )}
          >
            <span className="inline-flex items-center border-r border-navy/15 bg-cream/50 px-3 text-sm font-semibold text-navy">
              +91
            </span>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="98765 43210"
              value={data.phone}
              onChange={(e) =>
                onChange("phone", e.target.value.replace(/[^\d\s]/g, "").slice(0, 12))
              }
              className="w-full bg-transparent px-4 py-3 text-sm text-navy outline-none placeholder:text-slate/50"
            />
          </div>
        </Field>

        <Field
          id="occupation"
          label="Your Occupation"
          required
          error={errors.occupation}
        >
          <SelectDropdown
            id="occupation"
            value={data.occupation}
            options={occupationOptions}
            placeholder="Select occupation"
            error={Boolean(errors.occupation)}
            onChange={(value) => onChange("occupation", value)}
          />
        </Field>

        <Field id="state" label="State" required error={errors.state}>
          <SelectDropdown
            id="state"
            value={data.state}
            options={stateOptions}
            placeholder="Select state"
            error={Boolean(errors.state)}
            onChange={(value) => onChange("state", value)}
            maxMenuHeight={240}
            searchable
          />
        </Field>

        <Field id="city" label="City" required error={errors.city}>
          <input
            id="city"
            name="city"
            type="text"
            placeholder="Enter your city"
            value={data.city}
            onChange={(e) => onChange("city", e.target.value)}
            className={cn(inputClassName, errors.city && "border-red-400")}
          />
        </Field>

        <Field
          id="preferredBatch"
          label="Preferred Batch"
          required
          error={errors.preferredBatch}
        >
          <SelectDropdown
            id="preferredBatch"
            value={data.preferredBatch}
            options={batchOptions}
            placeholder="Select batch"
            error={Boolean(errors.preferredBatch)}
            onChange={(value) => onChange("preferredBatch", value)}
          />
        </Field>
      </div>
    </section>
  );
}
