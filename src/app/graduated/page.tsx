"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { useUser, UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  ShieldCheck,
  FileText,
  ExternalLink,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";
import { StatsCardSkeleton } from "@/components/ui";
import { PraxisLabBadge } from "@/components/ui/PraxisLabBadge";

interface GraduatedStudentProfile {
  department: string;
  cgpa?: number;
  rollNo?: string;
  enrollmentDate?: string;
  gradesheetUrl?: string | null;
  graduationDate?: string | null;
  status?: string;
  programLevel?: "BS" | "INTERMEDIATE";
  discipline?: string | null;
}

export default function StandaloneGraduatedPage() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<GraduatedStudentProfile | null>(null);
  const [dbName, setDbName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [gradesheetModalOpen, setGradesheetModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashRes, meRes] = await Promise.all([
          api.get<{ studentProfile?: GraduatedStudentProfile }>("/api/dashboard/student"),
          api.get("/api/me").catch(() => null),
        ]);

        if (meRes?.data?.name) {
          setDbName(meRes.data.name);
        }

        if (dashRes.data?.studentProfile) {
          setProfile(dashRes.data.studentProfile);
        }
      } catch (err) {
        console.error("Failed to load graduated student data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const displayName = dbName || user?.fullName || user?.firstName || "Graduated Student";
  const isIntermediate = profile?.programLevel === "INTERMEDIATE" || profile?.status === "HSSC Completed";
  const durationYears = isIntermediate ? 2 : 4;
  const startYear = profile?.enrollmentDate ? new Date(profile.enrollmentDate).getFullYear() : (isIntermediate ? 2024 : 2022);
  const endYear = startYear + durationYears;
  const batchStr = `Batch ${startYear}-${String(endYear).slice(-2)}`;
  const departmentOrDiscipline = isIntermediate ? (profile?.discipline || profile?.department || "Intermediate Studies") : (profile?.department || "Academic Department");
  const gradesheetUrl = profile?.gradesheetUrl;
  const isPdf = gradesheetUrl?.toLowerCase().includes("pdf") || gradesheetUrl?.startsWith("data:application/pdf");

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex flex-col justify-center max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-64 bg-muted animate-pulse rounded-lg" />
            <div className="h-4 w-40 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
        <div className="h-72 bg-muted animate-pulse rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Top Institutional Header (No Sidebar Options) */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/collegelogo.png"
              alt="Govt. Graduate College Hafizabad Logo"
              className="h-11 w-auto object-contain shrink-0"
            />
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-foreground leading-tight">
                Govt. Graduate College, Hafizabad
              </h1>
              <p className="text-xs text-muted-foreground font-semibold">
                Affiliated with University of the Punjab, Lahore
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </header>

      {/* Main Graduation Portal Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto py-8 px-4 sm:px-6 space-y-8">
        {/* Congratulatory Greeting */}
        <div className="flex flex-col gap-1 text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Congratulations, {displayName}! 🎓
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            Official Academic Graduation Portal — Verified Degree Completion Status
          </p>
        </div>

        {/* Modern Sleek Glassmorphic Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-amber-950/85 via-zinc-900 to-indigo-950 p-8 sm:p-10 text-white shadow-2xl"
        >
          <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none">
            <GraduationCap className="h-96 w-96 text-amber-400" />
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-amber-500/20 text-amber-300 border border-amber-400/40 px-3.5 py-1 text-xs font-black uppercase tracking-wider rounded-full backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-300 animate-pulse" />
                {isIntermediate ? "Official Intermediate Completed" : "Official Degree Holder"}
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-3 py-1 text-xs font-bold rounded-full backdrop-blur-md">
                <ShieldCheck className="h-3.5 w-3.5 mr-1 text-emerald-300" />
                {isIntermediate ? "All Parts (1 & 2) Cleared" : "All 8 Semesters Cleared"}
              </Badge>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                {isIntermediate ? "Intermediate Studies Completed" : "Degree Completed & Awarded"}
              </h3>
              <p className="text-amber-200/90 text-sm sm:text-base font-medium leading-relaxed">
                Congratulations on successfully completing your {isIntermediate ? "Intermediate program" : "degree"} in <strong>{departmentOrDiscipline}</strong> at Govt. Graduate College, Hafizabad! Your official academic record and clearance documents are verified and archived.
              </p>
            </div>

            {/* EXACTLY TWO PRIMARY ACTION BUTTONS */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/graduated/alumni">
                <Button className="h-12 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-amber-500/25 hover:scale-105 transition-all gap-2.5 cursor-pointer">
                  <Users className="h-5 w-5" />
                  Explore Alumni Section
                </Button>
              </Link>

              <Button
                onClick={() => setGradesheetModalOpen(true)}
                className="h-12 px-6 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold text-sm rounded-2xl backdrop-blur-md shadow-lg hover:scale-105 transition-all gap-2.5 cursor-pointer"
              >
                <FileText className="h-5 w-5 text-amber-300" />
                View Complete Degree Gradesheet
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Database Attribute Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="border border-border bg-card p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 shrink-0">
                <Award className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Final CGPA</p>
                <h4 className="text-3xl font-black text-foreground mt-0.5">
                  {profile?.cgpa ? profile.cgpa.toFixed(2) : "Passed"} <span className="text-xs text-muted-foreground font-normal">/ 4.00</span>
                </h4>
              </div>
            </div>
          </Card>

          <Card className="border border-border bg-card p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center border border-brand-primary/20 shrink-0">
                <BookOpen className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Department</p>
                <h4 className="text-xl font-bold text-foreground truncate mt-0.5">{profile?.department || "Computer Science"}</h4>
              </div>
            </div>
          </Card>

          <Card className="border border-border bg-card p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <Calendar className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Graduation Batch</p>
                <h4 className="text-xl font-black text-foreground mt-0.5">{batchStr}</h4>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Center Footer with Reusable Praxis Lab Badge */}
      <footer className="border-t border-border bg-card px-6 py-4 text-center text-xs text-muted-foreground font-medium flex flex-col sm:flex-row items-center justify-center gap-3">
        <span>Govt. Graduate College, Hafizabad &copy; {new Date().getFullYear()} — Official Digital Portal</span>
        <span className="hidden sm:inline text-muted-foreground/40">•</span>
        <PraxisLabBadge />
      </footer>

      {/* Degree Gradesheet Viewer Modal */}
      <Dialog open={gradesheetModalOpen} onOpenChange={setGradesheetModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                <FileText className="h-5 w-5 text-amber-500" />
                {isIntermediate ? "Official Intermediate Completion Gradesheet" : "Official Complete Degree Gradesheet"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Verified {isIntermediate ? "2-year academic transcript" : "8-semester academic transcript"} record for {displayName} ({departmentOrDiscipline})
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="py-4">
            {gradesheetUrl ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between bg-muted/40 p-3 rounded-2xl border border-border text-xs font-semibold gap-2">
                  <span>Document Format: <strong>{isPdf ? "PDF Transcript Document" : "Image Gradesheet"}</strong></span>
                  <div className="flex items-center gap-3">
                    <a
                      href={gradesheetUrl}
                      download={`${displayName.replace(/\s+/g, "_")}_Degree_Gradesheet.pdf`}
                      className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                    >
                      <FileText className="h-3.5 w-3.5" /> Download PDF
                    </a>
                    <a
                      href={gradesheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-brand-primary hover:underline font-bold"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Open Full Screen
                    </a>
                  </div>
                </div>

                <div className="rounded-2xl border border-border overflow-hidden bg-black/5 dark:bg-black/40 min-h-[480px] flex items-center justify-center">
                  {isPdf ? (
                    <object
                      data={gradesheetUrl}
                      type="application/pdf"
                      className="w-full h-[580px] rounded-2xl"
                    >
                      <iframe
                        src={gradesheetUrl}
                        className="w-full h-[580px] border-none rounded-2xl"
                        title="Degree Gradesheet Document"
                      >
                        <p className="p-6 text-center text-sm text-muted-foreground">
                          Your browser does not support inline PDF viewing. Please use the download link above to view your official transcript.
                        </p>
                      </iframe>
                    </object>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={gradesheetUrl}
                      alt="Degree Gradesheet Document"
                      className="max-h-[600px] w-auto max-w-full object-contain mx-auto rounded-xl shadow-lg"
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-card border border-border rounded-2xl space-y-3">
                <FileText className="h-12 w-12 mx-auto text-amber-500 opacity-50" />
                <h4 className="text-base font-bold text-foreground">
                  {isIntermediate ? "Intermediate Completion Document" : "Degree Gradesheet Document"}
                </h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Your graduation status is verified. The complete {isIntermediate ? "2-year academic completion" : "8-semester gradesheet"} document has been archived in college records.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setGradesheetModalOpen(false)} className="rounded-xl">
              Close Viewer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
