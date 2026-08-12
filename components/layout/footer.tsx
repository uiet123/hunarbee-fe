"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandWordmark } from "@/components/shared/brand-wordmark";
import { FOOTER_LINKS, SITE } from "@/lib/constants";

/** Site footer with gradient separator, logo, links, and contact. */
export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/portal")) {
    return null;
  }

  return (
    <footer className="relative border-t border-white/[0.06] bg-navy text-white">
      {/* Gradient separator glow */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-honey/50 to-transparent" aria-hidden />
      <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-navy/20 to-transparent pointer-events-none" aria-hidden />

      <div className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="group inline-flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="Hunarbee logo"
                width={48}
                height={48}
                className="h-11 w-11 rounded-xl object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <BrandWordmark onDark className="text-xl transition-opacity group-hover:opacity-90" />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
              {SITE.description}
            </p>
            <div className="mt-6 space-y-1">
              <p className="text-sm text-white/55 transition-colors hover:text-white/80">
                {SITE.email}
              </p>
              <p className="text-sm text-white/55 transition-colors hover:text-white/80">
                {SITE.phone}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-honey">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.quick.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group/link inline-flex items-center gap-1 text-sm text-white/70 transition-all hover:text-white hover:translate-x-0.5"
                  >
                    <span className="h-px w-0 bg-honey transition-all group-hover/link:w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-honey">
              Programs
            </h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.programs.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group/link inline-flex items-center gap-1 text-sm text-white/70 transition-all hover:text-white hover:translate-x-0.5"
                  >
                    <span className="h-px w-0 bg-honey transition-all group-hover/link:w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-honey">
              Social
            </h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.social.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group/link inline-flex items-center gap-1 text-sm text-white/70 transition-all hover:text-white hover:translate-x-0.5"
                  >
                    <span className="h-px w-0 bg-honey transition-all group-hover/link:w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/45">
            © {new Date().getFullYear()} Hunarbee. All rights reserved.
          </p>
          <p className="text-sm text-white/45">{SITE.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
