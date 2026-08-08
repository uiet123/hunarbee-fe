"use client";

import Link from "next/link";
import {
  Code2,
  BriefcaseBusiness,
  MessageCircle,
  MessagesSquare,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { COMMUNITY_LINKS } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/shared/section";
import { Stagger, StaggerItem } from "@/components/shared/fade-in";

const ICONS: Record<string, LucideIcon> = {
  MessageCircle,
  MessagesSquare,
  Linkedin: BriefcaseBusiness,
  Github: Code2,
};

/** Community channel cards with subtle hover motion. */
export function CommunitySection() {
  return (
    <Section
      id="community"
      className="bg-cream/35"
      eyebrow="Community"
      title="Learn with people who ship"
      description="Join spaces where peers, mentors, and alumni share opportunities, feedback, and momentum."
    >
      <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {COMMUNITY_LINKS.map((item) => {
          const Icon = ICONS[item.icon] ?? MessageCircle;
          return (
            <StaggerItem key={item.title}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.25 }}>
                <Link href={item.href} className="block h-full">
                  <Card interactive className="group h-full">
                    <CardContent className="flex h-full flex-col gap-4 pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy text-honey">
                          <Icon className="h-5 w-5" />
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-slate transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-navy" />
                      </div>
                      <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-navy">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-slate">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}
