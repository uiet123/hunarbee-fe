"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { BrandWordmark } from "@/components/shared/brand-wordmark";
import { Button } from "@/components/ui/button";
import {
  PortalApiError,
  portalLogin,
  setPortalToken,
} from "@/lib/portal";
import { cn } from "@/lib/utils";

/** Immersive student portal login — brand-first, calm, high-trust. */
export function PortalLoginExperience() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await portalLogin(email.trim(), password);
      setPortalToken(data.token);
      router.replace("/portal");
    } catch (err) {
      setError(
        err instanceof PortalApiError
          ? err.message
          : "Unable to sign in. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-navy text-white">
      <div className="pointer-events-none absolute inset-0 honeycomb-bg opacity-40" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 15% 20%, rgba(245,184,0,0.18), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(245,184,0,0.08), transparent 50%), linear-gradient(160deg, #0b1220 0%, #152238 45%, #0b1220 100%)",
        }}
      />

      <div className="relative mx-auto grid min-h-screen max-w-[1200px] lg:grid-cols-[1.05fr_0.95fr]">
        {/* Brand plane */}
        <section className="relative flex flex-col justify-between px-6 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3"
          >
            <Image
              src="/logo.png"
              alt="Hunarbee"
              width={44}
              height={44}
              className="h-11 w-11 rounded-xl object-contain"
              priority
            />
            <BrandWordmark onDark className="text-2xl sm:text-3xl" />
          </motion.div>

          <div className="my-16 max-w-lg lg:my-0">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.55 }}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-honey"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Student workspace
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]"
            >
              Your internship
              <span className="block text-honey">starts here.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.55 }}
              className="mt-5 max-w-md text-base leading-relaxed text-white/65 sm:text-lg"
            >
              Sign in with the email and password from your enrollment welcome
              mail. Projects, mentors, and progress — one calm place.
            </motion.p>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-sm text-white/40"
          >
            New here?{" "}
            <Link href="/apply" className="text-honey underline-offset-4 hover:underline">
              Apply for an internship
            </Link>
          </motion.p>
        </section>

        {/* Login form plane */}
        <section className="relative flex items-center px-6 pb-12 sm:px-10 lg:px-12 lg:pb-0">
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md rounded-[28px] border border-white/10 bg-surface-elevated/[0.06] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-9"
          >
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white">
              Sign in
            </h2>
            <p className="mt-2 text-sm text-white/55">
              Use credentials from your Hunarbee enrollment email.
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50">
                  Email
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full rounded-2xl border border-white/15 bg-surface-elevated/[0.06] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-honey/60 focus:ring-4 focus:ring-honey/15"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50">
                  Password
                </span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your temporary password"
                    className="w-full rounded-2xl border border-white/15 bg-surface-elevated/[0.06] px-4 py-3.5 pr-12 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-honey/60 focus:ring-4 focus:ring-honey/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/45 transition hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </label>

              {error ? (
                <p
                  className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className={cn("w-full text-base", loading && "opacity-90")}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Enter portal
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
