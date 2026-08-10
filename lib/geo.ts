import { getCountryName } from "./phone";

export interface DetectedLocation {
  countryIso: string;
  countryName: string;
}

/**
 * Detect visitor country from IP (client-side).
 * Falls back to India if the lookup fails.
 */
export async function detectUserCountry(): Promise<DetectedLocation> {
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4000);

    const response = await fetch("https://ipwho.is/", {
      signal: controller.signal,
    });
    window.clearTimeout(timeout);

    if (!response.ok) {
      throw new Error("Geo lookup failed");
    }

    const data = (await response.json()) as {
      success?: boolean;
      country_code?: string;
      country?: string;
    };

    if (!data.success || !data.country_code) {
      throw new Error("Invalid geo payload");
    }

    const countryIso = data.country_code.toUpperCase();
    return {
      countryIso,
      countryName: data.country || getCountryName(countryIso),
    };
  } catch {
    return {
      countryIso: "IN",
      countryName: "India",
    };
  }
}
