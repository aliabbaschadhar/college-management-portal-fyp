"use client";

import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  GraduationCap,
  Users,
  ClipboardCheck,
  BarChart3,
  BookOpen,
  Calendar,
  MessageSquare,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Star,
} from "lucide-react";
import Header from "@/components/Header";

const features = [
  {
    icon: Users,
    title: "Smart Admissions",
    desc: "Fully digital admission workflows with real-time status tracking and document management.",
    color: "from-blue-500 to-blue-600",
    glow: "blue",
  },
  {
    icon: ClipboardCheck,
    title: "Attendance Tracking",
    desc: "One-click attendance marking with live percentage calculations and alert thresholds.",
    color: "from-emerald-500 to-emerald-600",
    glow: "emerald",
  },
  {
    icon: BookOpen,
    title: "Online Quizzes",
    desc: "Build question banks and deploy auto-graded assessments directly from the dashboard.",
    color: "from-purple-500 to-purple-600",
    glow: "purple",
  },
  {
    icon: Calendar,
    title: "Timetable Engine",
    desc: "Conflict-free timetable generation with smart room allocation and schedule exports.",
    color: "from-orange-500 to-orange-600",
    glow: "orange",
  },
  {
    icon: BarChart3,
    title: "Analytics Suite",
    desc: "Powerful dashboards to visualize trends, track KPIs, and make data-driven decisions.",
    color: "from-pink-500 to-pink-600",
    glow: "pink",
  },
  {
    icon: MessageSquare,
    title: "Feedback Portal",
    desc: "Anonymous, structured faculty feedback that drives measurable teaching improvements.",
    color: "from-teal-500 to-teal-600",
    glow: "teal",
  },
  {
    icon: CreditCard,
    title: "Fee Management",
    desc: "Transparent fee structures and dues tracking — always up-to-date, never missing.",
    color: "from-yellow-500 to-yellow-600",
    glow: "yellow",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    desc: "Clerk-powered auth with strict RBAC — every user sees exactly what they need.",
    color: "from-red-500 to-red-600",
    glow: "red",
  },
];

const roles = [
  {
    title: "Students",
    tag: "your academic world",
    description: "Access grades, attendance, timetables, quizzes, and dues — all in one personalized portal.",
    perks: ["Live grade & attendance dashboard", "Online quiz attempts", "Personal timetable view", "Dues & fee status"],
    icon: GraduationCap,
    accent: "#3D5EE1",
  },
  {
    title: "Faculty",
    tag: "where teaching meets data",
    description: "Reduce administrative overhead and focus on teaching. Everything from attendance to quiz creation, done.",
    perks: ["One-click attendance marking", "Quiz & question bank builder", "Class performance analytics", "Teaching schedule at a glance"],
    icon: Star,
    accent: "#6FCCD8",
  },
  {
    title: "Admins",
    tag: "total institutional control",
    description: "Complete oversight of the entire institution — admissions, records, timetables, finances and more.",
    perks: ["Manage all user accounts", "Generate conflict-free timetables", "Fee structure management", "Institutional analytics"],
    icon: Zap,
    accent: "#A78BFA",
  },
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="flex min-h-screen flex-col bg-[#080C14] text-white overflow-x-hidden">
      <Header />

      {/* ─────────────────────────────────────────────── */}
      {/* HERO                                           */}
      {/* ─────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Layered ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] h-[700px] w-[700px] rounded-full bg-[#3D5EE1] opacity-[0.12] blur-[120px]" />
          <div className="absolute bottom-[-5%] right-[-5%] h-[560px] w-[560px] rounded-full bg-[#6FCCD8] opacity-[0.10] blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[800px] rounded-full bg-[#3D5EE1] opacity-[0.05] blur-[80px]" />
        </div>

        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 flex flex-col items-center text-center px-4 pt-24 pb-16 max-w-6xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-white/70 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6FCCD8] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6FCCD8]" />
            </span>
            Govt. Graduate College, Hafizabad &mdash; FYP 2022-26
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-[clamp(2.8rem,6vw,6.5rem)] font-black tracking-[-0.03em] leading-[1.05] max-w-5xl"
          >
            <span className="text-white">The College Portal</span>
            <br />
            <span
              className="inline-block"
              style={{
                background: "linear-gradient(135deg, #3D5EE1 0%, #6FCCD8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Built for Everyone.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="mt-6 max-w-2xl text-lg md:text-xl text-white/50 leading-relaxed font-light"
          >
            Admissions, attendance, quizzes, timetables, grades, and fees — all automated and accessible for students, faculty and administrators.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <SignedOut>
              <Link href="/sign-up">
                <button className="group relative overflow-hidden rounded-xl px-7 py-4 text-base font-bold text-white transition-all hover:brightness-110 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #3D5EE1, #6FCCD8)" }}>
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started — It&apos;s Free
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </Link>
              <Link href="/sign-in">
                <button className="rounded-xl border border-white/15 bg-white/5 px-7 py-4 text-base font-semibold text-white/80 backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/25 active:scale-95">
                  Sign In
                </button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="group relative overflow-hidden rounded-xl px-7 py-4 text-base font-bold text-white transition-all hover:brightness-110 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #3D5EE1, #6FCCD8)" }}>
                  <span className="relative z-10 flex items-center gap-2">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </Link>
            </SignedIn>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-8 md:gap-16"
          >
            {[
              { val: "3", label: "User Roles" },
              { val: "9+", label: "Core Modules" },
              { val: "100%", label: "Web-Based" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl md:text-4xl font-black tracking-tight"
                  style={{ background: "linear-gradient(135deg, #3D5EE1, #6FCCD8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  {s.val}
                </p>
                <p className="mt-1 text-sm text-white/40 font-medium">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080C14] to-transparent pointer-events-none" />
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* FEATURES                                       */}
      {/* ─────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 md:mb-20"
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#6FCCD8] mb-4">
              Features
            </p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.08] text-white max-w-xl">
              Everything you need. Nothing you don&apos;t.
            </h2>
          </motion.div>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="group relative rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 backdrop-blur-sm
                           hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 cursor-pointer"
              >
                {/* Hover glow */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${f.color}`}
                  style={{ filter: "blur(40px)", zIndex: -1, transform: "scale(0.7)" }} />

                {/* Icon */}
                <div className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} shadow-lg`}>
                  <f.icon className="h-5 w-5 text-white" />
                </div>

                <h3 className="mb-2 text-[1.05rem] font-bold text-white">{f.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* ROLES                                          */}
      {/* ─────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-4 relative">
        {/* Section glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-[#3D5EE1] opacity-[0.06] blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 md:mb-20"
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#6FCCD8] mb-4">
              Roles
            </p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.08] text-white max-w-xl">
              Tailored for every person in your college.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {roles.map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm group hover:border-white/[0.14] transition-all duration-300"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-8 right-8 h-[2px] rounded-b-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${role.accent}, transparent)` }} />

                {/* Icon */}
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10"
                  style={{ background: `${role.accent}20` }}>
                  <role.icon className="h-6 w-6" style={{ color: role.accent }} />
                </div>

                <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: role.accent }}>
                  {role.tag}
                </p>
                <h3 className="mb-3 text-2xl font-black tracking-tight text-white">{role.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed mb-6">{role.description}</p>

                <ul className="space-y-2.5">
                  {role.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5 text-sm text-white/60">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: role.accent }} />
                      {perk}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <SignedOut>
                    <Link href="/sign-up"
                      className="group/link inline-flex items-center gap-1.5 text-sm font-semibold transition-all"
                      style={{ color: role.accent }}>
                      Get started
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  </SignedOut>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* FINAL CTA                                      */}
      {/* ─────────────────────────────────────────────── */}
      <section className="py-24 md:py-40 px-4 relative overflow-hidden">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[900px] rounded-full opacity-40 blur-[60px]"
            style={{ background: "radial-gradient(ellipse, #3D5EE1 0%, transparent 70%)" }} />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl border border-white/[0.1] p-12 md:p-20 backdrop-blur-xl"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 h-24 w-24 rounded-tl-3xl border-t border-l"
              style={{ borderColor: "#3D5EE1" }} />
            <div className="absolute bottom-0 right-0 h-24 w-24 rounded-br-3xl border-b border-r"
              style={{ borderColor: "#6FCCD8" }} />

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#6FCCD8] mb-6">
              Start Today
            </p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05] text-white mb-6">
              Ready to transform your college&apos;s digital experience?
            </h2>
            <p className="text-lg text-white/50 mb-10 max-w-lg mx-auto leading-relaxed">
              Join students, faculty and admins already using the portal. Set up takes minutes, benefits last forever.
            </p>

            <SignedOut>
              <Link href="/sign-up">
                <button className="group relative overflow-hidden rounded-xl px-8 py-4 text-base font-bold text-white transition-all hover:brightness-110 active:scale-95 shadow-2xl"
                  style={{ background: "linear-gradient(135deg, #3D5EE1, #6FCCD8)", boxShadow: "0 0 40px rgba(61,94,225,0.35)" }}>
                  <span className="relative z-10 flex items-center gap-2">
                    Create Your Free Account
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="group relative overflow-hidden rounded-xl px-8 py-4 text-base font-bold text-white transition-all hover:brightness-110 active:scale-95 shadow-2xl"
                  style={{ background: "linear-gradient(135deg, #3D5EE1, #6FCCD8)", boxShadow: "0 0 40px rgba(61,94,225,0.35)" }}>
                  <span className="relative z-10 flex items-center gap-2">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </Link>
            </SignedIn>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* FOOTER                                         */}
      {/* ─────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] bg-[#080C14] py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3D5EE1, #6FCCD8)" }}>
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-base font-black tracking-tight text-white">
              College Management Portal
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm font-medium text-white/40">
            <Link href="/" className="hover:text-white/80 transition-colors">Home</Link>
            <Link href="/sign-in" className="hover:text-white/80 transition-colors">Sign In</Link>
            <Link href="/sign-up" className="hover:text-white/80 transition-colors">Sign Up</Link>
          </div>

          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} Govt. Graduate College, Hafizabad
          </p>
        </div>
      </footer>
    </div>
  );
}