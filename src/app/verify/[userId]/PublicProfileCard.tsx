"use client";

import { motion } from "framer-motion";
import {
  User,
  GraduationCap,
  BookOpen,
  Building2,
  Calendar,
  Clock,
  MapPin,
  BadgeCheck,
  AlertCircle,
  Shield,
  Briefcase,
  Mail,
  Phone,
  Sunrise,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface CurrentLecture {
  courseName: string;
  courseCode: string;
  room: string;
  startTime: string;
  endTime: string;
}

interface CourseInfo {
  courseCode: string;
  courseName: string;
  creditHours: number;
  semester?: number;
  shift?: string;
}

export interface ProfileData {
  name: string;
  role: "STUDENT" | "FACULTY" | "ADMIN";
  institution: string;
  email?: string;
  avatarUrl?: string | null;
  currentLecture: CurrentLecture | null;
  // Student fields
  rollNo?: string;
  phone?: string | null;
  department?: string;
  semester?: number;
  shift?: string;
  enrollmentDate?: string;
  cgpa?: number;
  blocked?: boolean;
  approvedBy?: string | null;
  attendanceRate?: number | null;
  duesStatus?: "Outstanding" | "Clear";
  outstandingFees?: number;
  enrolledCourses?: CourseInfo[];
  // Faculty fields
  specialization?: string;
  joinDate?: string;
  assignedCourses?: CourseInfo[];
  todayAttendance?: {
    status: string;
    checkInTime: string | null;
    checkOutTime: string | null;
  } | null;
  // Admin fields
  designation?: string;
}

const roleConfig = {
  STUDENT: {
    label: "Student",
    icon: GraduationCap,
    gradient: "from-brand-primary to-brand-secondary",
    statusLabel: "Active Student",
    statusColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    blockedLabel: "Account Suspended",
    blockedColor: "bg-red-500/10 text-red-600 border-red-500/20",
  },
  FACULTY: {
    label: "Faculty Instructor",
    icon: Briefcase,
    gradient: "from-[#A78BFA] to-brand-primary",
    statusLabel: "Faculty Instructor",
    statusColor: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    blockedLabel: "",
    blockedColor: "",
  },
  ADMIN: {
    label: "Administrator",
    icon: Shield,
    gradient: "from-system-danger to-[#F59E0B]",
    statusLabel: "System Administrator",
    statusColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    blockedLabel: "",
    blockedColor: "",
  },
};

/* ── Info Row ─────────────────────────────────── */
function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3 text-sm"
    >
      <div className="w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
        <Icon className="w-[18px] h-[18px] text-brand-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className={`font-medium text-brand-dark truncate ${mono ? "font-mono" : ""}`}>
          {value}
        </p>
      </div>
    </motion.div>
  );
}

/* ── Main Component ───────────────────────────── */
export function PublicProfileCard({ profile }: { profile: ProfileData }) {
  const config = roleConfig[profile.role];
  const RoleIcon = config.icon;

  const isBlocked = profile.role === "STUDENT" && profile.blocked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-2xl"
    >
      <div className="bg-brand-white rounded-3xl shadow-xl overflow-hidden border border-brand-light grid grid-cols-1 md:grid-cols-12">
        {/* ═══ Left Column: Header Information ═══ */}
        <div
          className={`md:col-span-5 bg-gradient-to-br ${config.gradient} p-6 text-center relative flex flex-col justify-between items-center`}
        >
          {/* Top badges */}
          <div className="w-full flex items-center justify-between gap-2">
            <div
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold border backdrop-blur-sm ${
                isBlocked
                  ? "bg-red-500/20 text-red-100 border-red-400/30"
                  : "bg-white/20 text-white border-white/20"
              }`}
            >
              {isBlocked ? (
                <>
                  <XCircle className="w-3 h-3" />
                  Suspended
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  {config.statusLabel}
                </>
              )}
            </div>

            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] text-white font-semibold">
              <BadgeCheck className="w-3.5 h-3.5" />
              Official Verified
            </div>
          </div>

          <div className="my-auto py-6">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
              className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm mx-auto flex items-center justify-center mb-3 border-2 border-white/30 overflow-hidden ring-4 ring-white/10 shadow-lg"
            >
              {profile.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="object-cover h-full w-full"
                />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </motion.div>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-2xl font-black text-white mb-1"
            >
              {profile.name}
            </motion.h1>

            {/* Roll No / Subtitle */}
            {profile.rollNo && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.28 }}
                className="text-sm text-white/80 font-mono font-semibold mb-3"
              >
                {profile.rollNo}
              </motion.p>
            )}

            {/* Role & Department pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 flex-wrap"
            >
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3.5 py-1 text-xs text-white font-bold">
                <RoleIcon className="w-3.5 h-3.5" />
                {config.label}
              </span>
              {profile.department && (
                <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white/90 font-medium">
                  {profile.department}
                </span>
              )}
              {profile.semester !== undefined && (
                <span className="inline-flex items-center bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white/90 font-medium">
                  Semester {profile.semester}
                </span>
              )}
            </motion.div>
          </div>

          <div className="w-full text-center pt-2 text-[10px] text-white/60 font-mono">
            VERIFIED PROFILE
          </div>
        </div>

        {/* ═══ Right Column: Related Data & Details ═══ */}
        <div className="md:col-span-7 flex flex-col justify-between bg-card">
          <div className="p-6 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Profile &amp; Academic Details
            </h3>

            <InfoRow
              icon={Building2}
              label="Institution"
              value={profile.institution}
              delay={0.35}
            />

            {profile.role === "STUDENT" && (
              <>
                {profile.rollNo && (
                  <InfoRow
                    icon={BookOpen}
                    label="Roll Number"
                    value={profile.rollNo}
                    mono
                    delay={0.4}
                  />
                )}
                {profile.department && (
                  <InfoRow
                    icon={GraduationCap}
                    label="Department"
                    value={profile.department}
                    delay={0.45}
                  />
                )}
                {profile.semester !== undefined && (
                  <InfoRow
                    icon={Calendar}
                    label="Semester"
                    value={`Semester ${profile.semester}`}
                    delay={0.5}
                  />
                )}
                {profile.shift && (
                  <InfoRow
                    icon={Sunrise}
                    label="Shift"
                    value={`${profile.shift} Shift`}
                    delay={0.52}
                  />
                )}
                {profile.enrollmentDate && (
                  <InfoRow
                    icon={Calendar}
                    label="Enrolled Since"
                    value={new Date(profile.enrollmentDate).toLocaleDateString("en-PK", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    delay={0.55}
                  />
                )}
                {profile.duesStatus && (
                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
                      {profile.duesStatus === "Clear" ? (
                        <BadgeCheck className="w-[18px] h-[18px] text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-[18px] h-[18px] text-rose-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Dues Status</p>
                      <p
                        className={`font-semibold ${
                          profile.duesStatus === "Clear"
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {profile.duesStatus === "Clear"
                          ? "✓ All Dues Clear"
                          : "⚠ Dues Outstanding"}
                      </p>
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {profile.role === "FACULTY" && (
              <>
                {profile.department && (
                  <InfoRow
                    icon={GraduationCap}
                    label="Department"
                    value={profile.department}
                    delay={0.4}
                  />
                )}
                {profile.specialization && (
                  <InfoRow
                    icon={Briefcase}
                    label="Specialization"
                    value={profile.specialization}
                    delay={0.45}
                  />
                )}
                {profile.joinDate && (
                  <InfoRow
                    icon={Calendar}
                    label="Joined"
                    value={new Date(profile.joinDate).toLocaleDateString("en-PK", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    delay={0.5}
                  />
                )}
              </>
            )}

            {profile.role === "ADMIN" && (
              <InfoRow
                icon={Shield}
                label="Designation"
                value={profile.designation ?? "System Administrator"}
                delay={0.4}
              />
            )}

            {profile.email && (
              <InfoRow
                icon={Mail}
                label="Email Address"
                value={profile.email}
                mono
                delay={0.65}
              />
            )}

            {profile.phone !== undefined && profile.phone !== null && (
              <InfoRow
                icon={Phone}
                label="Phone Number"
                value={profile.phone}
                delay={0.7}
              />
            )}

            {/* Current lecture panel */}
            {profile.currentLecture ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
                className="mt-2 p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/10"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[11px] font-bold text-brand-primary uppercase tracking-wider">
                    Currently In Class
                  </span>
                </div>
                <p className="font-bold text-sm text-foreground">
                  {profile.currentLecture.courseName}
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  {profile.currentLecture.courseCode}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    {profile.currentLecture.room}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {profile.currentLecture.startTime} – {profile.currentLecture.endTime}
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
                className="mt-2 p-3 bg-muted/30 rounded-xl border border-border flex items-center gap-2 text-xs text-muted-foreground font-medium"
              >
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>No active class scheduled right now</span>
              </motion.div>
            )}
          </div>

          {/* ═══ Footer ═══ */}
          <div className="px-6 py-3 bg-muted/40 border-t border-border text-center">
            <p className="text-xs font-semibold text-muted-foreground">
              Verified by College Management Portal
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              Scanned at{" "}
              {new Date().toLocaleString("en-PK", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
