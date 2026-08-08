export const SITE = {
  name: "Hunarbee",
  tagline: "Internships that build real careers",
  description:
    "Hunarbee is a modern internship platform connecting students with real projects, industry mentors, and career-ready skills.",
  url: "https://hunarbee.com",
  email: "hello@hunarbee.com",
  phone: "+91 98765 43210",
} as const;

export const NAV_LINKS = [
  { label: "Programs", href: "#programs" },
  { label: "Process", href: "#process" },
  { label: "Community", href: "#community" },
  { label: "FAQ", href: "#faq" },
] as const;

export const STATS = [
  { value: 1000, suffix: "+", label: "Students" },
  { value: 50, suffix: "+", label: "Projects" },
  { value: 20, suffix: "+", label: "Mentors" },
  { value: 95, suffix: "%", label: "Completion Rate" },
] as const;

export const WHY_FEATURES = [
  {
    title: "Real Projects",
    description:
      "Ship production-grade work for real stakeholders—not toy assignments.",
    icon: "Briefcase",
  },
  {
    title: "Industry Mentorship",
    description:
      "Learn directly from engineers and leads who hire and ship at scale.",
    icon: "Users",
  },
  {
    title: "Internship Certificate",
    description:
      "Earn a verifiable certificate that employers can trust and validate.",
    icon: "Award",
  },
  {
    title: "Portfolio Building",
    description:
      "Graduate with a portfolio that proves skill, not just a resume line.",
    icon: "FolderKanban",
  },
  {
    title: "Career Guidance",
    description:
      "Get structured coaching for interviews, resumes, and role readiness.",
    icon: "Compass",
  },
  {
    title: "Remote Learning",
    description:
      "Train from anywhere with live sessions, async reviews, and clear milestones.",
    icon: "Laptop",
  },
] as const;

export const PROGRAMS = [
  {
    title: "Frontend Development",
    duration: "8–12 weeks",
    mode: "Remote · Live",
    highlights: ["Certificate", "Live Projects", "Mentorship"],
    description:
      "Master modern UI engineering with React, TypeScript, and design systems.",
  },
  {
    title: "Backend Development",
    duration: "8–12 weeks",
    mode: "Remote · Live",
    highlights: ["Certificate", "Live Projects", "Mentorship"],
    description:
      "Build APIs, databases, and services with production-minded architecture.",
  },
  {
    title: "Full Stack Development",
    duration: "12–16 weeks",
    mode: "Remote · Live",
    highlights: ["Certificate", "Live Projects", "Mentorship"],
    description:
      "Own the full product loop—from interface to infrastructure—end to end.",
  },
] as const;

export const PROCESS_STEPS = [
  {
    title: "Apply",
    description: "Share your goals and background in a short application.",
  },
  {
    title: "Interview",
    description: "A focused conversation to assess fit and readiness.",
  },
  {
    title: "Selection",
    description: "Join a cohort matched to your track and pace.",
  },
  {
    title: "Training",
    description: "Structured learning with mentor feedback every week.",
  },
  {
    title: "Live Projects",
    description: "Contribute to real deliverables with accountable ownership.",
  },
  {
    title: "Certificate",
    description: "Receive a verifiable internship certificate upon completion.",
  },
  {
    title: "Placement Support",
    description: "Get guidance for roles, referrals, and interview prep.",
  },
] as const;

export const TESTIMONIALS = [
  {
    name: "Aanya Sharma",
    role: "Frontend Intern → Junior Engineer",
    rating: 5,
    quote:
      "Hunarbee felt like a real engineering team. I shipped features, got sharp reviews, and walked away with a portfolio that actually opened doors.",
  },
  {
    name: "Rohan Mehta",
    role: "Full Stack Intern",
    rating: 5,
    quote:
      "The mentorship was the difference. Clear milestones, production standards, and feedback that made me level up week after week.",
  },
  {
    name: "Priya Nair",
    role: "Backend Intern",
    rating: 5,
    quote:
      "I finally understood how backend systems work in the wild. The certificate and project stories made interviews far less stressful.",
  },
] as const;

export const COMMUNITY_LINKS = [
  {
    title: "WhatsApp Community",
    description: "Daily updates, peer support, and opportunity alerts.",
    href: "#",
    icon: "MessageCircle",
  },
  {
    title: "Discord",
    description: "Channels for projects, doubt-solving, and hangouts.",
    href: "#",
    icon: "MessagesSquare",
  },
  {
    title: "LinkedIn",
    description: "Follow wins, hiring updates, and alumni stories.",
    href: "#",
    icon: "Linkedin",
  },
  {
    title: "GitHub",
    description: "Explore open work, templates, and learning repos.",
    href: "#",
    icon: "Github",
  },
] as const;

export const FAQS = [
  {
    question: "Who is Hunarbee for?",
    answer:
      "Students and early-career builders who want internship experience grounded in real projects, mentorship, and career outcomes—not just coursework.",
  },
  {
    question: "Is the internship remote?",
    answer:
      "Yes. Programs are designed for remote participation with live sessions, structured async work, and mentor check-ins.",
  },
  {
    question: "Will I receive a certificate?",
    answer:
      "Yes. Completing the program earns a verifiable internship certificate you can share with employers.",
  },
  {
    question: "Do I need prior experience?",
    answer:
      "Basic familiarity with programming helps, but each track is structured so motivated beginners can grow quickly with guidance.",
  },
  {
    question: "How does placement support work?",
    answer:
      "We help with portfolio polish, resume framing, mock interviews, and role targeting so you present your work with clarity and confidence.",
  },
  {
    question: "How long are the programs?",
    answer:
      "Most tracks run 8–16 weeks depending on specialization. Exact timelines are shared during selection.",
  },
] as const;

export const FOOTER_LINKS = {
  quick: [
    { label: "Why Hunarbee", href: "#why" },
    { label: "Programs", href: "#programs" },
    { label: "Process", href: "#process" },
    { label: "FAQ", href: "#faq" },
  ],
  programs: [
    { label: "Frontend", href: "#programs" },
    { label: "Backend", href: "#programs" },
    { label: "Full Stack", href: "#programs" },
  ],
  social: [
    { label: "LinkedIn", href: "#" },
    { label: "GitHub", href: "#" },
    { label: "Discord", href: "#" },
    { label: "WhatsApp", href: "#" },
  ],
} as const;
