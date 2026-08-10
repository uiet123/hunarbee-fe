import countryToCurrency from "country-to-currency";

/** ISO 4217 currency code used for display + Razorpay charge. */
export type PricingCurrency = string;

/** Bundlers sometimes wrap ESM default exports — unwrap safely. */
function resolveCountryCurrencyMap(): Record<string, string> {
  const mod = countryToCurrency as unknown;
  if (mod && typeof mod === "object") {
    const maybeWrapped = mod as { default?: Record<string, string> };
    if (maybeWrapped.default && typeof maybeWrapped.default === "object") {
      return maybeWrapped.default;
    }
    return mod as Record<string, string>;
  }
  return {};
}

const COUNTRY_CURRENCY = resolveCountryCurrencyMap();

function isCurrencyCode(value: string): boolean {
  return /^[A-Z]{3}$/.test(value);
}

/**
 * Map any world country ISO → that country's default currency.
 * Backend converts via live FX; if FX has no rate, API falls back to USD.
 */
export function getCurrencyForCountryIso(iso: string): PricingCurrency {
  if (!iso) return "USD";
  const mapped = COUNTRY_CURRENCY[iso.toUpperCase()];
  if (mapped && isCurrencyCode(mapped)) {
    return mapped;
  }
  return "USD";
}

export function formatMoney(amount: number, currency: PricingCurrency): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function getPricingLabel(currency: PricingCurrency, countryName?: string) {
  if (currency === "INR") {
    return countryName ? `Prices in ₹ · ${countryName}` : "Prices in ₹";
  }
  return countryName
    ? `Live FX in ${currency} · ${countryName}`
    : `Live FX in ${currency}`;
}
