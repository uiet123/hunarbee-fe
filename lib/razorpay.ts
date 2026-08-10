export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  customer_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  /** Lock prefill so Checkout does not swap in a remembered +91 customer. */
  readonly?: {
    name?: boolean;
    email?: boolean;
    contact?: boolean;
  };
  remember_customer?: boolean;
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: {
    ondismiss?: () => void;
  };
  handler: (response: RazorpaySuccessResponse) => void;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

const SCRIPT_ID = "razorpay-checkout-js";
const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/** Drop Razorpay's remembered "Using as +91…" identity from this browser. */
function clearRazorpayBrowserIdentity() {
  if (typeof window === "undefined") return;

  const stores: Storage[] = [];
  try {
    stores.push(window.localStorage);
  } catch {
    /* ignore */
  }
  try {
    stores.push(window.sessionStorage);
  } catch {
    /* ignore */
  }

  for (const store of stores) {
    const keys: string[] = [];
    for (let i = 0; i < store.length; i += 1) {
      const key = store.key(i);
      if (key && /razor|rzp/i.test(key)) {
        keys.push(key);
      }
    }
    keys.forEach((key) => store.removeItem(key));
  }
}

/** Load Razorpay Checkout script once. */
export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay can only load in the browser"));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Razorpay"))
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(options: RazorpayCheckoutOptions) {
  clearRazorpayBrowserIdentity();
  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error("Razorpay SDK not available");
  }

  const checkout = new window.Razorpay({
    ...options,
    remember_customer: false,
  });
  checkout.open();
  return checkout;
}
