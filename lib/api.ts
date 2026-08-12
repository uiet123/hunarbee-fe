const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string; data?: T }
    | null;

  if (!response.ok || !payload?.success) {
    throw new ApiError(
      payload?.message || "Something went wrong. Please try again.",
      response.status
    );
  }

  return payload.data as T;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  amountMajor: number;
  currency: string;
  keyId: string;
  receipt: string;
  durationId: string;
  pricingSource?: "live" | "fallback";
  customerId?: string | null;
  contact?: string | null;
}

export interface PaymentStatusResponse {
  orderId: string;
  paymentId: string | null;
  enrollmentId: string | null;
  status: "created" | "paid" | "failed";
  amountMajor: number;
  currency: string;
  programId: string | null;
  durationId: string | null;
}

export interface PlanPrices {
  "1-month": number;
  "2-months": number;
  "3-months": number;
}

export interface PricingResponse {
  currency: string;
  source: "live" | "fallback";
  provider?: string;
  asOf?: string;
  baseInr: PlanPrices;
  plans: PlanPrices;
  rateFromInr: number | null;
}

export function fetchPricing(currency: string) {
  return request<PricingResponse>(
    `/api/payments/pricing?currency=${encodeURIComponent(currency)}`
  );
}

export function createPaymentOrder(body: {
  durationId: "1-month" | "2-months" | "3-months";
  currency: string;
  programId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  countryIso: string;
  occupation: string;
  preferredBatch: string;
}) {
  return request<CreateOrderResponse>("/api/payments/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function fetchPaymentStatus(orderId: string) {
  return request<PaymentStatusResponse>(
    `/api/payments/orders/${encodeURIComponent(orderId)}`
  );
}

/** Wait until Razorpay webhook marks the order paid/failed. */
export async function waitForPaymentSettlement(
  orderId: string,
  options?: { timeoutMs?: number; intervalMs?: number }
): Promise<PaymentStatusResponse> {
  const timeoutMs = options?.timeoutMs ?? 45000;
  const intervalMs = options?.intervalMs ?? 1500;
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const status = await fetchPaymentStatus(orderId);
    if (status.status === "paid" || status.status === "failed") {
      return status;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new ApiError(
    "Payment is still processing. If money was deducted, enrollment will confirm shortly.",
    408
  );
}
