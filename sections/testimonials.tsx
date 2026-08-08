"use client";

import { Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/shared/section";
import { Stagger, StaggerItem } from "@/components/shared/fade-in";

/** Glass-style student testimonial cards. */
export function TestimonialsSection() {
  return (
    <Section
      id="testimonials"
      tone="dark"
      className="bg-navy"
      eyebrow="Why Students Love Hunarbee"
      title="Stories from builders who leveled up"
      titleClassName="sm:whitespace-nowrap"
      headingClassName="max-w-4xl"
      description="Real feedback from interns who shipped work, earned certificates, and moved forward with confidence."
    >
      <Stagger className="grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((item) => (
          <StaggerItem key={item.name}>
            <Card className="h-full border-white/10 bg-white/5 shadow-none backdrop-blur-md">
              <CardContent className="flex h-full flex-col gap-5 pt-6">
                <div
                  className="flex gap-1"
                  aria-label={`${item.rating} out of 5 stars`}
                >
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-honey text-honey"
                      aria-hidden
                    />
                  ))}
                </div>
                <p className="flex-1 text-[15px] leading-relaxed text-white/80">
                  “{item.quote}”
                </p>
                <div className="flex items-center gap-3 border-t border-white/10 pt-5">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-honey/20 text-sm font-bold text-honey"
                    aria-hidden
                  >
                    {item.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-white/55">{item.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
