"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/axios";
import { useUser, UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  GraduationCap,
  Award,
  ArrowLeft,
  Mail,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { DEPARTMENTS } from "@/lib/constants";
import { INTERMEDIATE_DISCIPLINES } from "@/lib/constants/academic";
import { GridSkeleton } from "@/components/ui";
import { PraxisLabBadge } from "@/components/ui/PraxisLabBadge";

interface AlumniItem {
  id: string;
  rollNo: string;
  name: string;
  email?: string;
  avatar?: string | null;
  department: string;
  graduationYear: number;
  batch: string;
  cgpa?: number;
  shift?: string;
  status?: string;
}

export default function StandaloneAlumniDirectoryPage() {
  const { isLoaded } = useUser();
  const [alumni, setAlumni] = useState<AlumniItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [programLevel, setProgramLevel] = useState<"BS" | "INTERMEDIATE">("BS");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAlumni = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("programLevel", programLevel);
      if (selectedDept && selectedDept !== "all") {
        params.set("department", selectedDept);
      }
      if (searchQuery.trim()) {
        params.set("q", searchQuery.trim());
      }
      const res = await api.get<AlumniItem[]>(`/api/alumni?${params.toString()}`);
      setAlumni(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load alumni directory:", err);
    } finally {
      setLoading(false);
    }
  }, [programLevel, selectedDept, searchQuery]);

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Top Institutional Header (Identical and Consistent) */}
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

      {/* Main Alumni Directory Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto py-8 px-4 sm:px-6 space-y-6">
        {/* Navigation Action Bar */}
        <div>
          <Link href="/graduated">
            <Button variant="outline" size="sm" className="rounded-xl gap-2 font-bold text-xs border-2 cursor-pointer hover:border-brand-primary">
              <ArrowLeft className="h-4 w-4 text-brand-primary" /> Return to Graduation Portal
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
              <Users className="h-8 w-8 text-brand-primary" />
              Official Alumni Directory
            </h1>
            <p className="text-sm text-muted-foreground font-medium mt-1">
              Connect with graduated alumni members across all academic departments
            </p>
          </div>

          <Badge variant="outline" className="px-3.5 py-1.5 rounded-xl border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs">
            {alumni.length} Graduated Alumni
          </Badge>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-card p-4 rounded-2xl border border-border shadow-xs">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, roll number, department..."
              className="pl-10 h-10 rounded-xl"
            />
          </div>

          <div>
            <Select
              value={programLevel}
              onValueChange={(val: "BS" | "INTERMEDIATE") => {
                setProgramLevel(val);
                setSelectedDept("all");
              }}
            >
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Program Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BS">BS Program</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate (HSSC)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder={programLevel === "INTERMEDIATE" ? "All Disciplines" : "All Departments"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{programLevel === "INTERMEDIATE" ? "All Disciplines" : "All Departments"}</SelectItem>
                {(programLevel === "INTERMEDIATE" ? INTERMEDIATE_DISCIPLINES : DEPARTMENTS).map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <GridSkeleton count={6} />
        ) : alumni.length === 0 ? (
          <div className="text-center py-16 px-6 text-muted-foreground bg-card border border-border rounded-3xl space-y-3">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <h3 className="text-xl font-bold text-foreground">No Alumni Records Found</h3>
            <p className="text-sm max-w-md mx-auto text-muted-foreground">
              No graduated alumni matched your filter or search query. Try resetting your search filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alumni.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Card className="p-6 rounded-3xl border-2 border-border/80 bg-card hover:border-brand-primary/50 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 font-black text-lg shrink-0">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground leading-snug truncate">
                            {item.name}
                          </h3>
                          <p className="text-xs font-mono font-semibold text-muted-foreground">
                            {item.rollNo}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 shrink-0">
                        {item.batch}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-xs border-t border-border/60 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                          <GraduationCap className="h-3.5 w-3.5 text-brand-primary" /> Department
                        </span>
                        <span className="font-bold text-foreground truncate max-w-[160px]">{item.department}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                          <Award className="h-3.5 w-3.5 text-amber-500" /> Final CGPA
                        </span>
                        <span className="font-bold text-foreground font-mono">{item.cgpa ? item.cgpa.toFixed(2) : "Passed"} / 4.00</span>
                      </div>
                      {item.email && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-indigo-500" /> Email
                          </span>
                          <a
                            href={`mailto:${item.email}`}
                            title={`Send email to ${item.email}`}
                            className="font-mono text-[11px] text-brand-primary hover:underline font-semibold truncate max-w-[170px]"
                          >
                            {item.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Center Footer with Reusable Praxis Lab Badge */}
      <footer className="border-t border-border bg-card px-6 py-4 text-center text-xs text-muted-foreground font-medium flex flex-col sm:flex-row items-center justify-center gap-3">
        <span>Govt. Graduate College, Hafizabad &copy; {new Date().getFullYear()} — Official Alumni Network</span>
        <span className="hidden sm:inline text-muted-foreground/40">•</span>
        <PraxisLabBadge />
      </footer>
    </div>
  );
}
