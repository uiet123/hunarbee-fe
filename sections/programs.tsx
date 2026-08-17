"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Clock, Monitor, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Section } from "@/components/shared/section";
import { Stagger, StaggerItem } from "@/components/shared/fade-in";
import { fetchPrograms, Program } from "@/lib/api";

/** Internship program cards with CTA. */
export function ProgramsSection() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrograms()
      .then((data) => setPrograms(data.programs || []))
      .catch((err) => {
        console.error("Failed to load programs", err);
        setError("Failed to load programs.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Section
      id="programs"
      className="bg-cream/35"
      eyebrow="Internship Programs"
      title="Choose the track that fits your ambition"
      description="Focused programs with live projects, mentor reviews, and a certificate that signals readiness."
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-honey" />
        </div>
      ) : error ? (
        <div className="text-center text-slate py-8">{error}</div>
      ) : programs.length === 0 ? (
        <div className="text-center text-slate py-8">No programs available at the moment.</div>
      ) : (
        <Stagger className="grid gap-6 lg:grid-cols-3">
          {programs.map((program, index) => (
            <StaggerItem key={program.id}>
              <Card
                interactive
                className={`relative flex h-full flex-col overflow-hidden ${
                  index === 1
                    ? "border-honey/40 shadow-[0_16px_48px_rgba(245,184,0,0.12)]"
                    : ""
                }`}
              >
                {index === 1 && (
                  <div className="absolute right-4 top-4 rounded-full bg-honey px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-navy">
                    Popular
                  </div>
                )}
                <CardHeader>
                  <h3 className="pr-16 font-[family-name:var(--font-display)] text-xl font-bold text-navy">
                    {program.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate">
                    {program.description}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-5">
                  <div className="flex flex-wrap gap-4 text-sm text-slate">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-honey-deep" />
                      {program.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Monitor className="h-4 w-4 text-honey-deep" />
                      {program.mode}
                    </span>
                  </div>
                  <ul className="space-y-2.5">
                    {program.highlights.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2.5 text-sm text-navy"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-honey/20">
                          <Check
                            className="h-3 w-3 text-honey-deep"
                            strokeWidth={2.5}
                          />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={index === 1 ? "primary" : "secondary"}
                    asChild
                  >
                    <Link href={`/apply?programId=${program.id}`}>
                      Apply now
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </Section>
  );
}
