"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { firstName, type PortalUser } from "@/lib/portal";

interface PortalTopBarProps {
  user: PortalUser | null;
}

const ROUTE_TITLES: Record<string, string> = {
  "/portal": "Dashboard",
  "/portal/internship": "My Internship",
  "/portal/projects": "Projects",
  "/portal/tasks": "Tasks",
  "/portal/resources": "Resources",
  "/portal/certificate": "Certificate",
  "/portal/payments": "Payments & Documents",
  "/portal/profile": "Profile",
  "/portal/courses": "My Courses",
  "/portal/schedule": "Schedule",
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

function UserInitials({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-honey to-honey-deep text-xs font-bold text-navy">
      {initials}
    </div>
  );
}

export function PortalTopBar({ user }: PortalTopBarProps) {
  const pathname = usePathname();
  const name = user ? firstName(user.name) : "Student";
  const [greeting, setGreeting] = useState("");
  
  const pageTitle = ROUTE_TITLES[pathname] || "Portal";

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-navy/[0.06] bg-surface-elevated/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-5 py-4 sm:px-8">
        {/* Left — greeting + page title */}
        <div className="ml-12 lg:ml-0">
          <p className="text-xs font-medium text-slate">
            {greeting ? `${greeting}, ` : ""}<span className="text-navy font-semibold">{name}</span>
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-navy sm:text-2xl">
            {pageTitle}
          </h1>
        </div>

        {/* Right — notifications + avatar */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-navy/8 bg-surface transition hover:border-honey/30 hover:shadow-sm"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px] text-slate" />
            {/* Notification dot */}
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-honey ring-2 ring-surface-elevated" />
          </button>

          {user && (
            <div className="hidden sm:block">
              <UserInitials name={user.name} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
