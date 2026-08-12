"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { PortalTopBar } from "@/components/portal/PortalTopBar";
import {
  clearPortalToken,
  fetchPortalHome,
  getPortalToken,
  PortalApiError,
  type PortalHome,
} from "@/lib/portal";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [home, setHome] = useState<PortalHome | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getPortalToken();
    if (!token) {
      router.replace("/portal/login");
      return;
    }

    let cancelled = false;
    fetchPortalHome(token)
      .then((data) => {
        if (!cancelled) {
          setHome(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        clearPortalToken();
        if (err instanceof PortalApiError && err.status === 401) {
          router.replace("/portal/login");
          return;
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-2xl bg-honey/15 animate-pulse-glow" />
            <Loader2 className="absolute inset-0 m-auto h-6 w-6 animate-spin text-honey" />
          </div>
          <p className="text-sm font-medium text-slate">Loading your portal…</p>
        </div>
      </div>
    );
  }

  const user = home?.user ?? null;

  return (
    <div className="min-h-screen bg-background">
      <PortalSidebar user={user} />

      {/* Main content area — offset by sidebar width on desktop */}
      <div className="lg:pl-[260px]">
        <PortalTopBar user={user} />
        <main className="portal-content-area min-h-[calc(100vh-73px)] px-5 py-6 sm:px-8 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
