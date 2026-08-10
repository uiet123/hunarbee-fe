import {
  getCountryCallingCode,
  getCountries,
  isValidPhoneNumber,
  parsePhoneNumber,
  type CountryCode,
} from "libphonenumber-js";
import en from "react-phone-number-input/locale/en.json";

export type { CountryCode };

/** All ISO countries supported by libphonenumber (world dial codes). */
const PHONE_COUNTRIES = getCountries();
const PHONE_COUNTRY_SET = new Set<string>(PHONE_COUNTRIES);

const PRIORITY_COUNTRIES = ["IN", "US", "GB", "AE", "SG", "AU", "CA"] as const;

export function isSupportedCountryIso(iso: string): boolean {
  return PHONE_COUNTRY_SET.has(iso.toUpperCase());
}

export function getCountryName(iso: CountryCode | string): string {
  const key = iso.toUpperCase() as CountryCode;
  return (en as Record<string, string>)[key] ?? key;
}

export function getDialCodeForIso(iso: string): string {
  try {
    return `+${getCountryCallingCode(iso.toUpperCase() as CountryCode)}`;
  } catch {
    return "+91";
  }
}

export interface CountryOption {
  iso: CountryCode;
  name: string;
  dial: string;
}

/** Sorted country list for the dedicated Country field (priority markets first). */
export function getCountryOptions(): CountryOption[] {
  const priority = new Set<string>(PRIORITY_COUNTRIES);

  const all = PHONE_COUNTRIES.map((iso) => {
    const name = getCountryName(iso);
    const dial = getDialCodeForIso(iso);
    return {
      iso,
      name,
      dial,
    };
  });

  const top = PRIORITY_COUNTRIES.map(
    (iso) => all.find((item) => item.iso === iso)!
  ).filter(Boolean);

  const rest = all
    .filter((item) => !priority.has(item.iso))
    .sort((a, b) => a.name.localeCompare(b.name));

  return [...top, ...rest];
}

/** Prefer E.164 for Razorpay; fall back to raw value if unparsable. */
export function toE164Phone(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed) return "";

  try {
    const parsed = parsePhoneNumber(trimmed);
    if (parsed?.number) return parsed.number;
  } catch {
    /* ignore */
  }

  return trimmed.startsWith("+") ? trimmed : `+${trimmed.replace(/\D/g, "")}`;
}

/**
 * Valid phone for the selected country.
 * E.164 numbers must belong to that country (not just be "some" valid number).
 */
export function isValidInternationalPhone(
  phone: string,
  countryIso?: string
): boolean {
  if (!phone.trim()) return false;

  try {
    if (countryIso) {
      const iso = countryIso.toUpperCase() as CountryCode;
      if (!isValidPhoneNumber(phone, iso)) return false;

      const parsed = parsePhoneNumber(phone, iso);
      if (!parsed) return false;

      // Prefer explicit country match when parse can detect it
      if (parsed.country && parsed.country !== iso) return false;
      return true;
    }

    return isValidPhoneNumber(phone);
  } catch {
    return false;
  }
}
