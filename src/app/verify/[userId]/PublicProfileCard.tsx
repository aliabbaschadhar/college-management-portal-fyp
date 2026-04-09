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
} from "lucide-react";

interface CurrentLecture {
  courseName: string;
  courseCode: string;
  room: string;
  startTime: string;
  endTime: string;
}

export interface ProfileData {
  name: string;
  role: "STUDENT" | "FACULTY" | "ADMIN";
  institution: string;
  currentLecture: CurrentLecture | null;
  rollNo?: string;
  department?: string;
  semester?: number;
  enrollmentDate?: string;
  duesStatus?: "Outstanding" | "Clear";
  specialization?: string;
  joinDate?: string;
  designation?: string;
}

const roleConfig = {
  STUDENT: {
    label: "Student",
    icon: GraduationCap,
    gradient: "from-brand-primary to-brand-secondary",
  },
  FACULTY: {
    label: "Faculty",
    icon: Briefcase,
    gradient: "from-[#A78BFA] to-brand-primary",
  },
  ADMIN: {
    label: "Administrator",
    icon: Shield,
    gradient: "from-system-danger to-[#F59E0B]",
  },
};

function ProfileRow({
  icon: Icon,
  label,
  value,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3 text-sm"
    >
      <div className="w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
        <Icon className="w-[18px] h-[18px] text-brand-primary" />
      </div>
      <div>
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="font-medium text-brand-dark">{value}</p>
      </div>
    </motion.div>
  );
}

export function PublicProfileCard({ profile }: { profile: ProfileData }) {
  const config = roleConfig[profile.role];
  const RoleIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <div className="bg-brand-white rounded-2xl shadow-xl overflow-hidden border border-brand-light">
        {/* Gradient header */}
        <div
          className={`bg-gradient-to-br ${config.gradient} px-6 py-10 text-center relative`}
        >
          {/* Verified badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            className="absolute top-4 right-4"
          >
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white font-medium">
              <BadgeCheck className="w-3.5 h-3.5" />
              Verified
            </div>
          </motion.div>

          {/* Avatar */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mx-auto flex items-center justify-center mb-4 border-2 border-white/30"
          >
            <User className="w-10 h-10 text-white" />
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-2xl font-bold text-white mb-2"
          >
            {profile.name}
          </motion.h1>

          {/* Role badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-white font-medium"
          >
            <RoleIcon className="w-4 h-4" />
            {config.label}
          </motion.div>
        </div>

        {/* Profile fields */}
        <div className="px-6 py-6 space-y-3.5">
          {/* Institution — shown for all roles */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="flex items-center gap-3 text-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
              <Building2 className="w-[18px] h-[18px] text-brand-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Institution</p>
              <p className="font-medium text-brand-dark">{profile.institution}</p>
            </div>
          </motion.div>

          {/* Student-specific fields */}
          {profile.role === "STUDENT" && (
            <>
              <ProfileRow
                icon={BookOpen}
                label="Roll Number"
                value={profile.rollNo ?? "—"}
                delay={0.4}
              />
              <ProfileRow
                icon={GraduationCap}
                label="Department"
                value={profile.department ?? "—"}
                delay={0.45}
              />
              <ProfileRow
                icon={Calendar}
                label="Semester"
                value={`Semester ${profile.semester ?? "—"}`}
                delay={0.5}
              />
              <ProfileRow
                icon={Calendar}
                label="Enrolled Since"
                value={
                  profile.enrollmentDate
                    ? new Date(profile.enrollmentDate).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"
                }
                delay={0.55}
              />

              {/* Dues status — color-coded */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-3 text-sm"
              >
                <div className="w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
                  {profile.duesStatus === "Clear" ? (
                    <BadgeCheck className="w-[18px] h-[18px] text-system-success" />
                  ) : (
                    <AlertCircle className="w-[18px] h-[18px] text-system-danger" />
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Dues Status</p>
                  <p
                    className={`font-semibold ${
                      profile.duesStatus === "Clear"
                        ? "text-system-success"
                        : "text-system-danger"
                    }`}
                  >
                    {profile.duesStatus === "Clear"
                      ? "✓ All Dues Clear"
                      : "⚠ Dues Outstanding"}
                  </p>
                </div>
              </motion.div>
            </>
          )}

          {/* Faculty-specific fields */}
          {profile.role === "FACULTY" && (
            <>
              <ProfileRow
                icon={GraduationCap}
                label="Department"
                value={profile.department ?? "—"}
                delay={0.4}
              />
              <ProfileRow
                icon={Briefcase}
                label="Specialization"
                value={profile.specialization ?? "—"}
                delay={0.45}
              />
              <ProfileRow
                icon={Calendar}
                label="Joined"
                value={
                  profile.joinDate
                    ? new Date(profile.joinDate).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"
                }
                delay={0.5}
              />
            </>
          )}

          {/* Admin-specific fields */}
          {profile.role === "ADMIN" && (
            <ProfileRow
              icon={Shield}
              label="Designation"
              value={profile.designation ?? "System Administrator"}
              delay={0.4}
            />
          )}

          {/* Current lecture panel */}
          {profile.currentLecture ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="mt-2 p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/10"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-system-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-system-success"></span>
                </span>
                <span className="text-xs font-semibold text-brand-primary uppercase tracking-wider">
                  Currently In Class
                </span>
              </div>
              <p className="font-semibold text-brand-dark">
                {profile.currentLecture.courseName}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                {profile.currentLecture.courseCode}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile.currentLecture.room}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {profile.currentLecture.startTime} – {profile.currentLecture.endTime}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="mt-2 p-4 bg-muted/40 rounded-xl border border-border flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>No active class at this time</span>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-brand-light/60 border-t border-brand-light text-center">
          <p className="text-xs text-muted-foreground">
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
    </motion.div>
  );
}
