"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Sticky glass navigation with mobile drawer. */
export function Header() {
  const pathname = usePathname();
  const isApply = pathname?.startsWith("/apply");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300",
        scrolled || open || isApply
          ? "border-navy/[0.06] bg-[rgba(217,226,238,0.92)] shadow-[0_8px_24px_rgba(11,18,32,0.05)] backdrop-blur-xl"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-24 max-w-[1280px] items-center justify-between px-5 sm:h-28 sm:px-8">
        <Link href="/" className="flex items-center" aria-label={SITE.name}>
          <Image
            src="/logo.png"
            alt="Hunarbee logo"
            width={128}
            height={128}
            className="h-20 w-20 object-contain sm:h-24 sm:w-24"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-10 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-medium text-slate transition-colors hover:text-navy"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isApply ? (
            <Button variant="secondary" size="md" className="text-base" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Home
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="secondary" size="md" className="text-base" asChild>
                <Link href="/#programs">Explore</Link>
              </Button>
              <Button size="md" className="text-base" asChild>
                <Link href="/apply">Apply for Internship</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-navy md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-[var(--border)] bg-[rgba(217,226,238,0.98)] backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col gap-1 px-5 py-4" aria-label="Mobile">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-base font-medium text-navy hover:bg-cream"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 flex flex-col gap-2 pb-2">
                {isApply ? (
                  <Button variant="secondary" asChild>
                    <Link href="/" onClick={() => setOpen(false)}>
                      <ArrowLeft className="h-4 w-4" />
                      Back to Home
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="secondary" asChild>
                      <Link href="/#programs" onClick={() => setOpen(false)}>
                        Explore Programs
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href="/apply" onClick={() => setOpen(false)}>
                        Apply for Internship
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
