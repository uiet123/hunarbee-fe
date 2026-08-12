"use client";

import { useMemo } from "react";
import {
  FORM_LIMITS,
  OCCUPATIONS,
  formatBatchLabel,
  getTomorrowBatchOption,
  sanitizeEmail,
  sanitizeName,
  type ApplicationFormData,
  type ApplicationFormErrors,
} from "@/lib/apply";
import { Field, inputClassName } from "./field";
import { SelectDropdown } from "./SelectDropdown";
import { CountryField } from "./CountryField";
import { PhoneNumberField } from "./PhoneNumberField";
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
        >
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Enter your full name"
            maxLength={FORM_LIMITS.text}
            value={data.fullName}
            onChange={(e) => onChange("fullName", sanitizeName(e.target.value))}
            className={cn(inputClassName, errors.fullName && "border-red-400")}
          />
        </Field>

        <Field
          id="email"
          label="Email Address"
          required
          error={errors.email}
        >
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            maxLength={FORM_LIMITS.text}
            value={data.email}
            onChange={(e) => onChange("email", sanitizeEmail(e.target.value))}
            className={cn(inputClassName, errors.email && "border-red-400")}
          />
        </Field>

        <Field
          id="countryIso"
          label="Country"
          required
          error={errors.countryIso}
        >
          <CountryField
            id="countryIso"
            value={data.countryIso}
            error={Boolean(errors.countryIso)}
            onChange={(iso) => onChange("countryIso", iso)}
          />
        </Field>

        <Field
          id="phone"
          label="Phone Number"
          required
          error={errors.phone}
        >
          <PhoneNumberField
            id="phone"
            value={data.phone}
            countryIso={data.countryIso}
            error={Boolean(errors.phone)}
            onPhoneChange={(phone) => onChange("phone", phone)}
          />
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
