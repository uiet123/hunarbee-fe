"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Target,
  Folder,
  CheckSquare,
  BookOpen,
  Award,
  CreditCard,
  UserCircle,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { BrandWordmark } from "@/components/shared/brand-wordmark";
import { clearPortalToken, type PortalUser } from "@/lib/portal";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/internship", label: "My Internship", icon: Target },
  { href: "/portal/projects", label: "Projects", icon: Folder },
  { href: "/portal/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/portal/resources", label: "Resources", icon: BookOpen },
  { href: "/portal/certificate", label: "Certificate", icon: Award },
  { href: "/portal/payments", label: "Payments & Documents", icon: CreditCard },
  { href: "/portal/profile", label: "Profile", icon: UserCircle },
] as const;

interface PortalSidebarProps {
  user: PortalUser | null;
}

function UserInitials({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-honey to-honey-deep text-sm font-bold text-navy">
      {initials}
    </div>
  );
}

function SidebarContent({ user, onClose }: PortalSidebarProps & { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    clearPortalToken();
    router.replace("/portal/login");
  };

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center justify-between px-5 pt-6 pb-2">
        <Link href="/portal" className="flex items-center gap-2.5" onClick={onClose}>
          <Image
            src="/logo.png"
            alt="Hunarbee"
            width={36}
            height={36}
            className="h-9 w-9 rounded-xl object-contain"
          />
          <BrandWordmark onDark className="text-lg" />
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/50 transition hover:bg-surface-elevated/10 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Badge */}
      <div className="mx-5 mt-4 mb-2 flex items-center gap-2 rounded-xl border border-honey/15 bg-honey/[0.06] px-3 py-2">
        <Sparkles className="h-3.5 w-3.5 text-honey" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-honey">
          Student Portal
        </span>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/portal"
              ? pathname === "/portal"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-honey/[0.12] text-honey shadow-[inset_0_0_0_1px_rgba(245,184,0,0.2)]"
                  : "text-white/50 hover:bg-surface-elevated/[0.06] hover:text-white/80"
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-honey"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  "h-[18px] w-[18px] transition-colors",
                  isActive ? "text-honey" : "text-white/40 group-hover:text-white/65"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/[0.07] px-4 py-4">
        {user && (
          <div className="mb-3 flex items-center gap-3 rounded-2xl bg-surface-elevated/[0.04] px-3 py-3">
            <UserInitials name={user.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {user.name}
              </p>
              <p className="truncate text-xs text-white/40">{user.email}</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-white/45 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function PortalSidebar({ user }: PortalSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-navy/95 text-white/70 shadow-lg backdrop-blur-md transition hover:bg-navy hover:text-white lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="portal-scrollbar hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-[260px] lg:flex-col overflow-y-auto bg-navy border-r border-white/[0.06]">
        <SidebarContent user={user} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="portal-scrollbar fixed inset-y-0 left-0 z-50 w-[280px] overflow-y-auto bg-navy shadow-2xl lg:hidden"
            >
              <SidebarContent
                user={user}
                onClose={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
