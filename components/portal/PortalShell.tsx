"use client";

interface PortalShellProps {
  children: React.ReactNode;
  pageTitle?: string;
}

/**
 * Transparent wrapper. 
 * The actual layout (sidebar + topbar) is now handled by app/portal/(authenticated)/layout.tsx.
 */
export function PortalShell({ children }: PortalShellProps) {
  return <>{children}</>;
}

/** Export home data hook for child pages */
export type { PortalHome } from "@/lib/portal";
