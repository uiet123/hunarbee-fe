/** Page hero for internship enrollment. */
export function ApplicationHeader() {
  return (
    <div className="relative overflow-hidden border-b border-[var(--border)]">
      <div className="pointer-events-none absolute inset-0 mesh-glow opacity-70" aria-hidden />
      <div className="pointer-events-none absolute inset-0 honeycomb-bg opacity-50" aria-hidden />

      <div className="relative mx-auto max-w-[1280px] px-5 pb-10 pt-32 sm:px-8 sm:pb-12 sm:pt-36">
        <div className="mb-4 flex items-center gap-3">
          <span className="hidden h-px w-8 bg-honey-deep/35 sm:block" aria-hidden />
          <span className="inline-flex items-center gap-2.5 font-[family-name:var(--font-display)] text-base font-semibold tracking-[0.06em] text-honey-deep sm:text-lg">
            <svg
              className="h-4 w-4 shrink-0 sm:h-[1.125rem] sm:w-[1.125rem]"
              viewBox="0 0 100 100"
              fill="none"
              aria-hidden
            >
              <path
                d="M50 12L82 31V69L50 88L18 69V31L50 12Z"
                stroke="currentColor"
                strokeWidth="8"
              />
            </svg>
            Internship enrollment
          </span>
          <span className="hidden h-px w-8 bg-honey-deep/35 sm:block" aria-hidden />
        </div>

        <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-navy sm:text-4xl md:text-[2.75rem] md:leading-[1.15]">
          Start Your Internship Journey
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate sm:text-lg">
          Build real-world skills, work on meaningful projects, and earn a
          verifiable internship certificate with Hunarbee.
        </p>
      </div>
    </div>
  );
}
