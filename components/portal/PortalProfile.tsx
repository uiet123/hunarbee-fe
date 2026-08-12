"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Globe,
  Key,
  Loader2,
  Mail,
  Moon,
  Shield,
  User,
} from "lucide-react";
import { PortalShell } from "@/components/portal/PortalShell";
import { Button } from "@/components/ui/button";
import {
  clearPortalToken,
  DURATION_LABELS,
  fetchPortalHome,
  formatBatchDate,
  getPortalToken,
  PortalApiError,
  PROGRAM_LABELS,
  type PortalHome,
} from "@/lib/portal";
import { cn } from "@/lib/utils";

/* ── Stagger animation ── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

export function PortalProfile() {
  const router = useRouter();
  const [home, setHome] = useState<PortalHome | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getPortalToken();
    if (!token) { router.replace("/portal/login"); return; }

    let cancelled = false;
    fetchPortalHome(token)
      .then((data) => { if (!cancelled) { setHome(data); setLoading(false); } })
      .catch((err) => {
        if (cancelled) return;
        clearPortalToken();
        if (err instanceof PortalApiError && err.status === 401) { router.replace("/portal/login"); return; }
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [router]);

  if (loading) {
    return (
      <PortalShell pageTitle="Profile">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-7 w-7 animate-spin text-honey" />
        </div>
      </PortalShell>
    );
  }

  const user = home?.user;
  const enrollment = home?.enrollments[0];
  const initials = user?.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "ST";

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <PortalShell pageTitle="Profile">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-[900px] space-y-6"
      >
        {/* ── Profile Header Card ── */}
        <motion.div
          variants={fadeUp}
          className="relative overflow-hidden rounded-[24px] border border-navy/10 bg-navy p-6 text-white shadow-[var(--shadow-lift)] sm:p-8"
        >
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background:
                "radial-gradient(ellipse 50% 70% at 80% 30%, rgba(245,184,0,0.12), transparent 55%)",
            }}
          />
          <div className="pointer-events-none absolute inset-0 honeycomb-bg opacity-15" aria-hidden />

          <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-honey to-honey-deep text-2xl font-bold text-navy shadow-[0_8px_24px_rgba(245,184,0,0.3)]">
                {initials}
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-navy bg-emerald-400">
                <CheckCircle2 className="h-3 w-3 text-white" />
              </span>
            </div>

            <div className="text-center sm:text-left">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight sm:text-3xl">
                {user?.name ?? "Student"}
              </h2>
              <p className="mt-1 text-sm text-white/50">{user?.email ?? "—"}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-white/40 sm:justify-start">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3 w-3" />
                  Joined {joinDate}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-honey/20 bg-honey/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-honey">
                  Student
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── Personal Information ── */}
          <motion.div
            variants={fadeUp}
            className="rounded-[24px] border border-navy/8 bg-surface-elevated/90 p-6 shadow-[var(--shadow-soft)] sm:p-7"
          >
            <h3 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-base font-bold text-navy">
              <User className="h-4 w-4 text-honey-deep" />
              Personal Information
            </h3>

            <div className="mt-5 space-y-4">
              <InfoRow icon={User} label="Full Name" value={user?.name ?? "—"} />
              <InfoRow icon={Mail} label="Email" value={user?.email ?? "—"} />
              <InfoRow icon={Globe} label="Role" value={user?.role ?? "student"} />
              <InfoRow icon={CalendarDays} label="Member Since" value={joinDate} />
            </div>
          </motion.div>

          {/* ── Enrollment Details ── */}
          <motion.div
            variants={fadeUp}
            className="rounded-[24px] border border-navy/8 bg-surface-elevated/90 p-6 shadow-[var(--shadow-soft)] sm:p-7"
          >
            <h3 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-base font-bold text-navy">
              <Shield className="h-4 w-4 text-honey-deep" />
              Enrollment Details
            </h3>

            {enrollment ? (
              <div className="mt-5 space-y-4">
                <InfoRow
                  icon={User}
                  label="Program"
                  value={PROGRAM_LABELS[enrollment.programId] ?? enrollment.programId}
                />
                <InfoRow
                  icon={CalendarDays}
                  label="Duration"
                  value={DURATION_LABELS[enrollment.durationId] ?? enrollment.durationId}
                />
                <InfoRow
                  icon={CalendarDays}
                  label="Batch"
                  value={formatBatchDate(enrollment.preferredBatch)}
                />
                <div className="flex items-center justify-between rounded-xl border border-navy/6 bg-surface px-4 py-3">
                  <span className="text-xs font-medium text-slate">Status</span>
                  <span className="flex items-center gap-2 text-sm font-semibold capitalize text-navy">
                    <span className="h-2 w-2 rounded-full bg-honey" />
                    {enrollment.status}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm text-slate">No active enrollment found.</p>
            )}
          </motion.div>
        </div>

        {/* ── Account Settings ── */}
        <motion.div
          variants={fadeUp}
          className="rounded-[24px] border border-navy/8 bg-surface-elevated/90 p-6 shadow-[var(--shadow-soft)] sm:p-7"
        >
          <h3 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-base font-bold text-navy">
            <Key className="h-4 w-4 text-honey-deep" />
            Account Settings
          </h3>

          <div className="mt-5 space-y-3">
            <SettingRow
              icon={Key}
              title="Change Password"
              description="Update your account password"
              actionLabel="Update"
            />
            <SettingRow
              icon={Bell}
              title="Notifications"
              description="Email & push notification preferences"
              actionLabel="Configure"
            />
            <SettingRow
              icon={Moon}
              title="Appearance"
              description="Theme and display settings"
              actionLabel="Coming soon"
              disabled
            />
          </div>
        </motion.div>
      </motion.div>
    </PortalShell>
  );
}

/* ── Info Row ── */
function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-navy/6 bg-surface px-4 py-3">
      <span className="flex items-center gap-2 text-xs font-medium text-slate">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="text-sm font-semibold text-navy">{value}</span>
    </div>
  );
}

/* ── Setting Row ── */
function SettingRow({
  icon: Icon,
  title,
  description,
  actionLabel,
  disabled,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-navy/6 bg-surface px-5 py-4 transition-all hover:border-honey/15 hover:shadow-sm">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-navy/[0.04]">
        <Icon className="h-[18px] w-[18px] text-slate" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-navy">{title}</p>
        <p className="text-xs text-slate">{description}</p>
      </div>
      <Button
        variant="secondary"
        size="sm"
        disabled={disabled}
        className={cn("flex-shrink-0", disabled && "opacity-50")}
      >
        {actionLabel}
      </Button>
    </div>
  );
}
