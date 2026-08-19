const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

const TOKEN_KEY = "hunarbee_portal_token";

export class PortalApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export interface PortalUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface PortalEnrollment {
  id: string;
  programId: string;
  durationId: string;
  preferredBatch: string;
  status: string;
  currency: string;
  amountPaise: number;
  createdAt: string;
  startDate?: string;
}

export interface PortalHome {
  user: PortalUser;
  enrollments: PortalEnrollment[];
}

async function portalRequest<T>(
  path: string,
  init?: RequestInit & { token?: string | null }
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (init?.token) {
    headers.Authorization = `Bearer ${init.token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...init,
    headers,
  });

  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string; data?: T }
    | null;

  if (!response.ok || !payload?.success) {
    throw new PortalApiError(
      payload?.message || "Something went wrong. Please try again.",
      response.status
    );
  }

  return payload.data as T;
}

export function getPortalToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setPortalToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearPortalToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function portalLogin(email: string, password: string) {
  return portalRequest<{ user: PortalUser; token: string }>(
    "/api/auth/portal/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );
}

export async function fetchPortalHome(token: string) {
  return portalRequest<PortalHome>("/api/auth/portal/home", {
    method: "GET",
    token,
  });
}

export const PROGRAM_LABELS: Record<string, string> = {
  frontend: "Frontend Development",
  backend: "Backend Development",
  fullstack: "Full Stack Development",
  prog_frontend: "Frontend Development",
  prog_backend: "Backend Development",
  prog_fullstack: "Full Stack Development",
};

export const DURATION_LABELS: Record<string, string> = {
  "1-month": "1 Month",
  "2-months": "2 Months",
  "3-months": "3 Months",
  "dur_1_month": "1 Month",
  "dur_2_months": "2 Months",
  "dur_3_months": "3 Months",
};

export function formatFallbackLabel(id: string): string {
  if (!id) return "";
  
  // Extract "X Month" or "X Months" if present
  const monthMatch = id.match(/(\d+)[\s_-]*month(s?)/i);
  if (monthMatch) {
    return `${monthMatch[1]} Month${monthMatch[2] ? 's' : ''}`;
  }

  let clean = id.replace(/^(prog_|dur_)/, '');
  clean = clean.replace(/-[a-z0-9]+$/, ''); // Remove random hash if created by admin
  clean = clean.replace(/[-_]/g, ' ');
  return clean.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function formatBatchDate(value: string): string {
  const raw = value.includes("T") ? value.slice(0, 10) : value;
  const [year, month, day] = raw.split("-").map(Number);
  if (!year || !month || !day) return raw;
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}
