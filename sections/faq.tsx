"use client";

import { FAQS } from "@/lib/constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Section } from "@/components/shared/section";
import { FadeIn } from "@/components/shared/fade-in";

/** FAQ accordion with smooth open/close animation. */
export function FaqSection() {
  return (
    <Section
      id="faq"
      eyebrow="FAQ"
      title="Answers before you apply"
      description="Straight answers to the questions students ask most."
    >
      <FadeIn>
        <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--border)] bg-white/85 px-5 shadow-[var(--shadow-soft)] sm:px-8">
          <Accordion type="single" collapsible defaultValue="item-0">
            {FAQS.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </FadeIn>
    </Section>
  );
}
