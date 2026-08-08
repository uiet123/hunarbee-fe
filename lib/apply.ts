export type InternshipProgramId = "frontend" | "backend" | "fullstack";
export type DurationPlanId = "1-month" | "3-months";

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
  priceInr: number;
  includes: string[];
  recommended?: boolean;
}

export interface ApplicationFormData {
  fullName: string;
  email: string;
  phone: string;
  occupation: string;
  state: string;
  city: string;
  preferredBatch: string;
  programId: InternshipProgramId | null;
  durationId: DurationPlanId | null;
  termsAccepted: boolean;
}

export type ApplicationFormErrors = Partial<
  Record<
    | "fullName"
    | "email"
    | "phone"
    | "occupation"
    | "state"
    | "city"
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
    priceInr: 499,
    includes: [
      "Guided learning",
      "Practical projects",
      "Internship experience",
      "Certificate",
    ],
  },
  {
    id: "3-months",
    label: "3 Months",
    months: 3,
    priceInr: 999,
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

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
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
  phone: "",
  occupation: "",
  state: "",
  city: "",
  preferredBatch: "",
  programId: null,
  durationId: "3-months",
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

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function getProgramById(id: InternshipProgramId | null) {
  return APPLY_PROGRAMS.find((p) => p.id === id) ?? null;
}

export function getPlanById(id: DurationPlanId | null) {
  return DURATION_PLANS.find((p) => p.id === id) ?? null;
}

export function validateApplicationForm(
  data: ApplicationFormData
): ApplicationFormErrors {
  const errors: ApplicationFormErrors = {};

  if (!data.fullName.trim() || data.fullName.trim().length < 2) {
    errors.fullName = "Please enter your full name";
  }

  if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Enter a valid email address";
  }

  const phoneDigits = data.phone.replace(/\D/g, "");
  if (phoneDigits.length !== 10) {
    errors.phone = "Enter a valid 10-digit mobile number";
  }

  if (!data.occupation) {
    errors.occupation = "Select your occupation";
  }

  if (!data.state) {
    errors.state = "Select your state";
  }

  if (!data.city.trim()) {
    errors.city = "City is required";
  }

  if (!data.preferredBatch) {
    errors.preferredBatch = "Select your preferred batch";
  }

  if (!data.programId) {
    errors.programId = "Select an internship program";
  }

  if (!data.durationId) {
    errors.durationId = "Select a duration plan";
  }

  if (!data.termsAccepted) {
    errors.termsAccepted = "Please accept the terms to continue";
  }

  return errors;
}

export function isApplicationFormComplete(data: ApplicationFormData): boolean {
  return Object.keys(validateApplicationForm(data)).length === 0;
}
