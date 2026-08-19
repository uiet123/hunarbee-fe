import { isSupportedCountryIso, isValidInternationalPhone } from "./phone";

export type InternshipProgramId = "frontend" | "backend" | "fullstack";
export type DurationPlanId = "1-month" | "2-months" | "3-months";

export interface InternshipProgram {
  id: InternshipProgramId;
  title: string;
  description: string;
  icon: "Monitor" | "Server" | "Layers";
}

export interface DurationPlan {
  id: DurationPlanId;
  label: string;
  months: number;
  includes: string[];
  recommended?: boolean;
}

export interface ApplicationFormData {
  fullName: string;
  email: string;
  /** ISO 3166-1 alpha-2 from phone library (e.g. IN, GB). */
  countryIso: string;
  /** E.164 phone (e.g. +9198…). */
  phone: string;
  occupation: string;
  preferredBatch: string;
  programId: string | null;
  durationId: string | null;
  termsAccepted: boolean;
}

export type ApplicationFormErrors = Partial<
  Record<
    | "fullName"
    | "email"
    | "countryIso"
    | "phone"
    | "occupation"
    | "preferredBatch"
    | "programId"
    | "durationId"
    | "termsAccepted",
    string
  >
>;

export const APPLY_PROGRAMS: InternshipProgram[] = [
  {
    id: "frontend",
    title: "Frontend Development",
    description:
      "Build modern interfaces using React, TypeScript and modern frontend technologies.",
    icon: "Monitor",
  },
  {
    id: "backend",
    title: "Backend Development",
    description:
      "Build APIs, databases and backend services using production-oriented technologies.",
    icon: "Server",
  },
  {
    id: "fullstack",
    title: "Full Stack Development",
    description:
      "Work across frontend, backend and databases to build complete applications.",
    icon: "Layers",
  },
];

export const DURATION_PLANS: DurationPlan[] = [
  {
    id: "1-month",
    label: "1 Month",
    months: 1,
    includes: [
      "Guided learning",
      "Practical projects",
      "Internship experience",
      "Certificate",
    ],
  },
  {
    id: "2-months",
    label: "2 Months",
    months: 2,
    includes: [
      "Guided learning",
      "Practical projects",
      "Mentor guidance",
      "Internship experience",
      "Certificate",
    ],
  },
  {
    id: "3-months",
    label: "3 Months",
    months: 3,
    recommended: true,
    includes: [
      "Guided learning",
      "Practical projects",
      "Mentor guidance",
      "Internship experience",
      "Certificate",
    ],
  },
];

export const OCCUPATIONS = [
  { value: "student", label: "Student" },
  { value: "fresher", label: "Fresher" },
  { value: "employee", label: "Employee" },
] as const;

export const APPLY_BENEFITS = [
  {
    title: "Real project experience",
    description: "Ship work that mirrors how product teams actually build.",
  },
  {
    title: "Mentor-backed growth",
    description: "Get structured feedback from people who ship and hire.",
  },
  {
    title: "Verifiable certificate",
    description: "Earn a credential you can share with employers confidently.",
  },
  {
    title: "Career-ready portfolio",
    description: "Leave with proof of skill—not just a line on your resume.",
  },
] as const;

export const INITIAL_APPLICATION_FORM: ApplicationFormData = {
  fullName: "",
  email: "",
  countryIso: "IN",
  phone: "",
  occupation: "",
  preferredBatch: "",
  programId: null,
  durationId: null,
  termsAccepted: false,
};

/** Tomorrow's date as ISO yyyy-mm-dd (local timezone). */
export function getTomorrowBatchValue(from: Date = new Date()): string {
  const tomorrow = new Date(from);
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Human-readable batch label, e.g. "2 May 2026". */
export function formatBatchLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;

  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getTomorrowBatchOption(from: Date = new Date()) {
  const value = getTomorrowBatchValue(from);
  return {
    value,
    label: formatBatchLabel(value),
  };
}

export function getProgramById(id: string | null) {
  return APPLY_PROGRAMS.find((p) => p.id === id) || null;
}

export function getPlanById(id: string | null) {
  return DURATION_PLANS.find((p) => p.id === id) || null;
}

export const FORM_LIMITS = {
  text: 50,
  nameMin: 2,
} as const;

const NAME_PATTERN = /^[a-zA-Z]+(?:[ .'-][a-zA-Z]+)*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clampText(value: string, max = FORM_LIMITS.text): string {
  return value.slice(0, max);
}

export function sanitizeName(value: string): string {
  return clampText(value.replace(/[^a-zA-Z .'-]/g, "").replace(/\s+/g, " "));
}

export function sanitizeEmail(value: string): string {
  return clampText(value.trimStart().replace(/\s/g, ""), FORM_LIMITS.text);
}

export function validateApplicationForm(
  data: ApplicationFormData,
  options?: { dbPrograms?: any[]; dbPlans?: any[] }
): ApplicationFormErrors {
  const errors: ApplicationFormErrors = {};
  const fullName = data.fullName.trim();
  const email = data.email.trim().toLowerCase();

  if (!fullName) {
    errors.fullName = "Full name is required";
  } else if (fullName.length < FORM_LIMITS.nameMin) {
    errors.fullName = `Name must be at least ${FORM_LIMITS.nameMin} characters`;
  } else if (fullName.length > FORM_LIMITS.text) {
    errors.fullName = `Name must be ${FORM_LIMITS.text} characters or less`;
  } else if (!NAME_PATTERN.test(fullName)) {
    errors.fullName = "Enter a valid name (letters only)";
  }

  if (!email) {
    errors.email = "Email is required";
  } else if (email.length > FORM_LIMITS.text) {
    errors.email = `Email must be ${FORM_LIMITS.text} characters or less`;
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address";
  }

  if (!data.countryIso) {
    errors.countryIso = "Select a country";
  } else if (!isSupportedCountryIso(data.countryIso)) {
    errors.countryIso = "Select a valid country";
  }

  if (!data.phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (!isValidInternationalPhone(data.phone, data.countryIso)) {
    errors.phone = "Enter a valid phone number for the selected country";
  }

  if (!data.occupation) {
    errors.occupation = "Select your occupation";
  } else if (!OCCUPATIONS.some((item) => item.value === data.occupation)) {
    errors.occupation = "Select a valid occupation";
  }

  if (!data.preferredBatch) {
    errors.preferredBatch = "Select your preferred batch";
  } else if (data.preferredBatch !== getTomorrowBatchValue()) {
    errors.preferredBatch = "Select a valid batch date";
  }

  if (!data.programId) {
    errors.programId = "Select an internship program";
  } else {
    const isStatic = APPLY_PROGRAMS.some((item) => item.id === data.programId);
    const isDynamic = options?.dbPrograms?.some((item) => item.id === data.programId);
    if (!isStatic && !isDynamic) {
      errors.programId = "Select a valid internship program";
    }
  }

  if (!data.durationId) {
    errors.durationId = "Select a duration plan";
  } else {
    const isStatic = DURATION_PLANS.some((item) => item.id === data.durationId);
    const isDynamic = options?.dbPlans?.some((item) => item.id === data.durationId);
    if (!isStatic && !isDynamic) {
      errors.durationId = "Select a valid duration plan";
    }
  }

  if (!data.termsAccepted) {
    errors.termsAccepted = "Please accept the terms to continue";
  }

  return errors;
}
