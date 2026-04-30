"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  GraduationCap,
  MessageSquare,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticCard from "@/components/MagneticCard";

gsap.registerPlugin(ScrollTrigger);

const operationsFlow = [
  {
    time: "08:10 AM",
    title: "Roll Call Window",
    owner: "Faculty",
    text: "Attendance is marked class-wise and late flags update instantly for first-period tracking.",
    icon: ClipboardCheck,
  },
  {
    time: "11:40 AM",
    title: "Assessment Block",
    owner: "Faculty + Students",
    text: "Question banks, quiz attempts, and grade entries stay synced across course sections.",
    icon: BookOpen,
  },
  {
    time: "01:30 PM",
    title: "Admissions Desk",
    owner: "Admin",
    text: "Application status changes, registration checks, and course allocation are handled from one queue.",
    icon: Users,
  },
  {
    time: "03:20 PM",
    title: "Finance + Alerts Review",
    owner: "Admin",
    text: "Dues summaries, pending fee notices, and attendance alerts are reviewed before day close.",
    icon: CreditCard,
  },
  {
    time: "05:00 PM",
    title: "Decision Snapshot",
    owner: "Principal Office",
    text: "Daily dashboard consolidates attendance trend, class progress, and critical notices.",
    icon: BarChart3,
  },
];

const commandStreams = [
  {
    title: "Academic Control",
    detail: "Course, attendance, timetable, and assessment operations in one rail.",
    bullets: ["Attendance Register", "Timetable Planning", "Assessments & Quiz Bank"],
    icon: GraduationCap,
  },
  {
    title: "Administrative Control",
    detail: "Admissions, dues, notices, and governance actions with role-safe access.",
    bullets: ["Admissions Pipeline", "Fees & Dues", "Role Security"],
    icon: Shield,
  },
  {
    title: "Insight Control",
    detail: "Institution-wide signals for intervention and policy decisions.",
    bullets: ["Progress Analytics", "Feedback Channel", "Daily Decision Snapshot"],
    icon: MessageSquare,
  },
];

const moduleRows = [
  {
    title: "Attendance Register",
    metric: "Live status",
    summary: "Mark present, absent, and late once. Percentages and warnings remain visible per student.",
    icon: ClipboardCheck,
  },
  {
    title: "Timetable Planning",
    metric: "Conflict checks",
    summary: "Teacher and room collisions are caught before publishing final weekly schedule.",
    icon: Calendar,
  },
  {
    title: "Assessments + Gradebook",
    metric: "Auto-scoring",
    summary: "Quiz attempts, score totals, and grade breakdowns stay aligned by course and section.",
    icon: BookOpen,
  },
  {
    title: "Admissions + Fees",
    metric: "Queue view",
    summary: "From applicant intake to dues visibility, admin can monitor each student lifecycle stage.",
    icon: Users,
  },
];

const rolePaths = [
  {
    title: "Students",
    summary: "Check grades, attendance, timetable, and dues from one personal dashboard.",
    points: ["Live attendance and grades", "Personal timetable", "Quiz participation", "Transparent dues status"],
  },
  {
    title: "Faculty",
    summary: "Manage classes efficiently with attendance, assessments, and academic insights.",
    points: ["Attendance workflow", "Question bank tools", "Performance snapshots", "Teaching schedule access"],
  },
  {
    title: "Admins",
    summary: "Oversee admissions, records, scheduling, and finance from one control center.",
    points: ["User and role management", "Timetable coordination", "Fee and dues control", "Institution-wide reporting"],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 3D Staggered Hero Reveal
    const words = heroTextRef.current?.querySelectorAll("span") || [];
    gsap.from(words, {
      z: 500,
      opacity: 0,
      rotateX: -45,
      stagger: 0.1,
      duration: 1.5,
      ease: "power4.out",
    });

    // Perspective Grid Animation on Scroll
    gsap.to(gridRef.current, {
      backgroundPositionY: "200%",
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    });

    // Floating Background Elements
    gsap.to(".floating-asset", {
      y: "random(-20, 20)",
      x: "random(-20, 20)",
      rotation: "random(-15, 15)",
      duration: "random(2, 4)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: {
        each: 0.5,
        from: "random",
      },
    });
    // Campus Flow Timeline Animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".campus-flow-container",
        start: "top 80%",
        end: "bottom 60%",
        scrub: 1,
      }
    });

    tl.fromTo(".campus-line", 
      { scaleY: 0 }, 
      { scaleY: 1, ease: "none", duration: 1 }
    );

    gsap.from(".campus-step", {
      opacity: 0,
      x: -30,
      stagger: 0.2,
      scrollTrigger: {
        trigger: ".campus-flow-container",
        start: "top 75%",
        toggleActions: "play none none reverse"
      }
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-brand-light text-brand-dark dark:bg-background dark:text-foreground overflow-hidden">
      <Header />

      <main id="main-content" className="relative overflow-x-hidden">
        {/* Advanced 3D Perspective Grid Background */}
        <div 
          ref={gridRef}
          className="pointer-events-none absolute inset-0 -z-20 opacity-[0.08] dark:opacity-[0.15]"
          style={{
            perspective: "1000px",
            transformStyle: "preserve-3d",
          }}
        >
          <div 
            className="absolute inset-x-0 -top-full h-[300%] w-full"
            style={{
              backgroundImage: `linear-gradient(to right, var(--color-brand-primary) 1px, transparent 1px), linear-gradient(to bottom, var(--color-brand-primary) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
              transform: "rotateX(60deg) translateY(-25%)",
              transformOrigin: "center top",
            }}
          />
        </div>

        {/* Floating Background Assets */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <GraduationCap className="floating-asset absolute left-[10%] top-[20%] h-24 w-24 text-brand-primary opacity-5 blur-[1px]" />
            <BookOpen className="floating-asset absolute right-[15%] top-[40%] h-20 w-20 text-brand-secondary opacity-5 blur-[2px]" />
            <Shield className="floating-asset absolute left-[20%] bottom-[15%] h-32 w-32 text-brand-primary opacity-5 blur-[1px]" />
            <Sparkles className="floating-asset absolute right-[10%] bottom-[30%] h-16 w-16 text-brand-secondary opacity-10" />
        </div>
        <section id="overview" className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pb-24 lg:pt-36">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-x-0 top-0 h-56 bg-linear-to-b from-brand-primary/20 to-transparent" />
            <div className="absolute bottom-8 left-1/3 h-52 w-52 rounded-full border border-brand-primary/15" />
            <div className="absolute top-24 right-8 h-60 w-60 rounded-full bg-brand-secondary/20 blur-3xl" />
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--color-brand-primary) 1px, transparent 1px), linear-gradient(to bottom, var(--color-brand-primary) 1px, transparent 1px)",
                backgroundSize: "42px 42px",
              }}
            />
          </div>

          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <motion.div
              initial={prefersReducedMotion ? false : "hidden"}
              animate={prefersReducedMotion ? undefined : "visible"}
              variants={fadeUp}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-white px-4 py-2 text-xs font-semibold tracking-wide text-brand-primary dark:bg-card sm:text-sm">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Govt. Graduate College, Hafizabad | BSCS FYP
              </div>

              <h1 
                ref={heroTextRef}
                className="mt-6 max-w-4xl text-4xl font-black leading-[1.08] tracking-tight text-brand-dark dark:text-foreground sm:text-5xl lg:text-6xl"
              >
                <span className="inline-block">Not</span> <span className="inline-block">another</span> <span className="inline-block">template</span> <span className="inline-block">dashboard.</span>
                <span className="block text-brand-primary mt-2">A daily operating system for your campus.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-brand-dark/80 dark:text-muted-foreground sm:text-lg">
                From first-period attendance to end-of-day reports, this portal is designed around real college routines in Hafizabad, not generic startup landing copy.
              </p>

              <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <SignedOut>
                  <Button asChild size="lg" className="bg-brand-primary text-brand-white hover:bg-brand-primary/90">
                    <Link href="/sign-up">
                      Start Your Account
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-brand-primary/30 bg-brand-white hover:bg-brand-primary/5 dark:bg-card dark:hover:bg-accent/40">
                    <Link href="#campus-flow">See Command Flow</Link>
                  </Button>
                </SignedOut>
                <SignedIn>
                  <Button asChild size="lg" className="bg-brand-primary text-brand-white hover:bg-brand-primary/90">
                    <Link href="/dashboard">
                      Continue to Dashboard
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </SignedIn>
              </div>
            </motion.div>

            <MagneticCard
              className="rounded-2xl border border-brand-primary/15 bg-brand-white p-6 shadow-sm dark:bg-card"
              tiltMax={10}
            >
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-primary">Command Snapshot</p>
              <div className="mt-4 space-y-4">
                {[
                  { label: "Departments", value: "Computer Science, Commerce, English" },
                  { label: "Today", value: "18 classes | 7 faculty sessions" },
                  { label: "Queue", value: "6 admission cases | 24 dues reminders" },
                  { label: "Status", value: "Attendance, assessments, and fee records synchronized" },
                ].map((row) => (
                  <div key={row.label} className="border-b border-brand-primary/10 pb-3 last:border-b-0 last:pb-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark/60 dark:text-muted-foreground">{row.label}</p>
                    <p className="mt-1 text-sm font-semibold text-brand-dark dark:text-foreground">{row.value}</p>
                  </div>
                ))}
              </div>
            </MagneticCard>
          </div>
        </section>

        <section aria-label="Platform proof points" className="px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
          <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-[1fr_1.2fr_1fr]">
            <Card className="border-brand-primary/15 bg-brand-white shadow-sm dark:bg-card">
              <CardContent className="p-6">
                <p className="text-3xl font-black text-brand-primary">3</p>
                <p className="mt-2 text-sm font-medium text-brand-dark/80 dark:text-muted-foreground">User roles with separate workflows</p>
              </CardContent>
            </Card>
            <Card className="border-brand-secondary/30 bg-brand-dark text-brand-white shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm font-bold uppercase tracking-widest text-brand-secondary">Operating Principle</p>
                <p className="mt-3 text-base leading-relaxed text-brand-white/85">
                  One source of truth from classroom to office desk. No duplicate sheets, no delayed records, no disconnected decisions.
                </p>
              </CardContent>
            </Card>
            <Card className="border-brand-primary/15 bg-brand-white shadow-sm dark:bg-card">
              <CardContent className="p-6">
                <p className="text-3xl font-black text-brand-primary">5</p>
                <p className="mt-2 text-sm font-medium text-brand-dark/80 dark:text-muted-foreground">Daily operational checkpoints covered</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="campus-flow" className="bg-brand-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20 dark:bg-card">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={prefersReducedMotion ? false : "hidden"}
              whileInView={prefersReducedMotion ? undefined : "visible"}
              viewport={{ once: true, amount: 0.25 }}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <p className="text-sm font-bold uppercase tracking-widest text-brand-primary">Daily command flow</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-brand-dark dark:text-foreground sm:text-4xl">
                Your day, mapped as an operations timeline.
              </h2>
            </motion.div>

            <div className="campus-flow-container relative rounded-2xl border border-brand-primary/10 bg-brand-light p-4 sm:p-6 dark:bg-background">
              <div className="campus-line absolute bottom-6 left-8 top-6 hidden w-px bg-brand-primary/20 md:block origin-top" />
              <div className="space-y-4">
                {operationsFlow.map((step, index) => {
                  const StepIcon = step.icon;
                  return (
                    <div
                      key={step.title}
                      className="campus-step"
                    >
                      <div className="grid gap-3 rounded-xl border border-brand-primary/10 bg-brand-white p-4 md:grid-cols-[auto_1fr] md:gap-5 md:p-5 dark:bg-card">
                        <div className="flex items-center gap-3 md:min-w-48 md:items-start md:gap-4">
                          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                            <StepIcon className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-primary">{step.time}</p>
                            <h3 className="mt-1 text-sm font-bold text-brand-dark dark:text-foreground sm:text-base">{step.title}</h3>
                            <p className="text-xs font-medium text-brand-dark/60 dark:text-muted-foreground">{step.owner}</p>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed text-brand-dark/75 dark:text-muted-foreground md:pt-1">{step.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="modules" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <motion.div
              initial={prefersReducedMotion ? false : "hidden"}
              whileInView={prefersReducedMotion ? undefined : "visible"}
              viewport={{ once: true, amount: 0.25 }}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="lg:sticky lg:top-28"
            >
              <p className="text-sm font-bold uppercase tracking-widest text-brand-primary">Command streams</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-brand-dark dark:text-foreground sm:text-4xl">One dashboard, three control rails.</h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-dark/75 dark:text-muted-foreground sm:text-base">
                Each rail solves a different operational domain while sharing the same student, course, and schedule data.
              </p>

              <div className="mt-6 space-y-3">
                {commandStreams.map((stream) => {
                  const StreamIcon = stream.icon;
                  return (
                    <Card key={stream.title} className="border-brand-primary/10 bg-brand-white shadow-sm dark:bg-card">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                            <StreamIcon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <div>
                            <p className="text-sm font-bold text-brand-dark dark:text-foreground">{stream.title}</p>
                            <p className="mt-1 text-xs leading-relaxed text-brand-dark/70 dark:text-muted-foreground">{stream.detail}</p>
                            <p className="mt-2 text-xs font-medium text-brand-primary/80">{stream.bullets.join(" | ")}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>

            <div className="space-y-4">
              {moduleRows.map((module, index) => {
                const ModuleIcon = module.icon;
                return (
                  <motion.div
                    key={module.title}
                    initial={prefersReducedMotion ? false : "hidden"}
                    whileInView={prefersReducedMotion ? undefined : "visible"}
                    viewport={{ once: true, amount: 0.2 }}
                    variants={fadeUp}
                    transition={{ duration: 0.45, delay: prefersReducedMotion ? 0 : index * 0.05 }}
                  >
                    <MagneticCard tiltMax={8} className="h-full">
                      <Card className="h-full border-brand-primary/10 bg-brand-white shadow-sm transition-transform duration-200 dark:bg-card">
                        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between h-full">
                          <div className="flex items-start gap-4">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                              <ModuleIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div>
                              <CardTitle className="text-lg font-bold text-brand-dark dark:text-foreground">{module.title}</CardTitle>
                              <p className="mt-2 text-sm leading-relaxed text-brand-dark/75 dark:text-muted-foreground">{module.summary}</p>
                            </div>
                          </div>
                          <span className="inline-flex items-center rounded-md border border-brand-primary/15 bg-brand-primary/5 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-brand-primary/80">
                            {module.metric}
                          </span>
                        </CardContent>
                      </Card>
                    </MagneticCard>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="roles" className="bg-brand-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20 dark:bg-card">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={prefersReducedMotion ? false : "hidden"}
              whileInView={prefersReducedMotion ? undefined : "visible"}
              viewport={{ once: true, amount: 0.25 }}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <p className="text-sm font-bold uppercase tracking-widest text-brand-primary">Role paths</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-brand-dark dark:text-foreground sm:text-4xl">
                Three interfaces, one data backbone.
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {rolePaths.map((role, index) => (
                <motion.div
                  key={role.title}
                  initial={prefersReducedMotion ? false : "hidden"}
                  whileInView={prefersReducedMotion ? undefined : "visible"}
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUp}
                  transition={{ duration: 0.45, delay: prefersReducedMotion ? 0 : index * 0.06 }}
                >
                  <MagneticCard tiltMax={10} className="h-full">
                    <Card className="h-full border-brand-primary/10 bg-brand-white shadow-sm dark:bg-background">
                      <CardHeader>
                        <CardTitle className="text-2xl font-black text-brand-dark dark:text-foreground">{role.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed text-brand-dark/75 dark:text-muted-foreground">{role.summary}</p>
                        <ul className="mt-5 space-y-2">
                          {role.points.map((point) => (
                            <li key={point} className="flex items-start gap-2 text-sm text-brand-dark/80 dark:text-muted-foreground">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" aria-hidden="true" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </MagneticCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="start" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <MagneticCard tiltMax={5} className="mx-auto max-w-5xl rounded-2xl overflow-hidden">
            <div className="border border-brand-primary/20 bg-brand-dark px-6 py-12 text-center text-brand-white shadow-sm sm:px-10">
              <p className="text-sm font-bold uppercase tracking-widest text-brand-secondary">Get started</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Move this semester to one control center.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-brand-white/80 sm:text-base">
                If your teams are still switching between register books, spreadsheets, and chat threads, this portal gives students, faculty, and admin one operational truth.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <SignedOut>
                  <Button asChild size="lg" className="bg-brand-primary text-brand-white hover:bg-brand-primary/90">
                    <Link href="/sign-up">
                      Create Account
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-brand-white/30 bg-transparent text-brand-white hover:bg-brand-white/10"
                  >
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                </SignedOut>
                <SignedIn>
                  <Button asChild size="lg" className="bg-brand-primary text-brand-white hover:bg-brand-primary/90">
                    <Link href="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </SignedIn>
              </div>
            </div>
          </MagneticCard>
        </section>
      </main>

      <Footer />
    </div>
  );
}