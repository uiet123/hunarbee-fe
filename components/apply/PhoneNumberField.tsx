"use client";

import { useMemo } from "react";
import {
  AsYouType,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import { getDialCodeForIso } from "@/lib/phone";
import { cn } from "@/lib/utils";

interface PhoneNumberFieldProps {
  id: string;
  value: string;
  countryIso: string;
  error?: boolean;
  onPhoneChange: (phone: string) => void;
}

function toNationalDigits(e164: string, countryIso: string): string {
  if (!e164) return "";
  try {
    const parsed = parsePhoneNumberFromString(e164, countryIso as CountryCode);
    if (parsed?.nationalNumber) return String(parsed.nationalNumber);
  } catch {
    /* ignore */
  }
  const dial = getDialCodeForIso(countryIso).replace(/\D/g, "");
  const digits = e164.replace(/\D/g, "");
  return digits.startsWith(dial) ? digits.slice(dial.length) : digits;
}

/**
 * Phone number only — dial code comes from the separate Country field.
 * Uses a plain input to avoid react-phone-number-input controlled update loops.
 */
export function PhoneNumberField({
  id,
  value,
  countryIso,
  error,
  onPhoneChange,
}: PhoneNumberFieldProps) {
  const country = (countryIso || "IN").toUpperCase() as CountryCode;
  const dial = getDialCodeForIso(country);

  const national = useMemo(
    () => toNationalDigits(value, country),
    [value, country]
  );

  const handleNationalChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 15);
    if (!digits) {
      if (value) onPhoneChange("");
      return;
    }

    const formatter = new AsYouType(country);
    formatter.input(digits);
    const number = formatter.getNumber();
    const next = number?.number ?? `${dial}${digits}`;

    if (next !== value) {
      onPhoneChange(next);
    }
  };

  return (
    <div
      className={cn(
        "flex overflow-hidden rounded-2xl border-2 border-navy/20 bg-surface shadow-[0_1px_2px_rgba(11,18,32,0.04)] transition-[border-color,box-shadow] duration-200 focus-within:border-honey focus-within:bg-surface-elevated focus-within:ring-4 focus-within:ring-honey/20",
        error && "border-red-400"
      )}
    >
      <span
        className="flex shrink-0 items-center border-r border-navy/15 bg-cream/50 px-3 py-3 text-sm font-semibold text-navy"
        aria-hidden
      >
        {dial}
      </span>
      <input
        id={id}
        name={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="Phone number"
        value={national}
        onChange={(e) => handleNationalChange(e.target.value)}
        className="w-full min-w-0 bg-transparent px-4 py-3 text-sm text-navy outline-none placeholder:text-slate/50"
      />
    </div>
  );
}
