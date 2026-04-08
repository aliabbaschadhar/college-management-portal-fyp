"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center bg-primary-navy text-white p-12">
        <div className="max-w-md text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-white/10 p-4">
              <GraduationCap className="h-16 w-16 text-secondary-cyan" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            College Management Portal
          </h1>
          <p className="text-lg text-blue-200 leading-relaxed">
            Streamlining academic excellence through unified digital management.
            Access your courses, grades, attendance, and more — all in one
            place.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-6">
            {[
              "Student Records",
              "Attendance",
              "Quiz System",
              "Analytics",
            ].map((feature) => (
              <div
                key={feature}
                className="rounded-lg bg-white/10 px-4 py-3 text-sm font-medium"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Sign In Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-light-blue px-4 py-12">
        {/* Mobile Logo */}
        <div className="mb-8 flex flex-col items-center lg:hidden">
          <GraduationCap className="h-10 w-10 text-primary-navy mb-2" />
          <h1 className="text-2xl font-bold text-primary-navy">
            College Management Portal
          </h1>
        </div>

        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-dark-grey">Welcome Back</h2>
            <p className="text-dark-grey/70 mt-1">
              Sign in to continue to your dashboard
            </p>
          </div>

          <div className="flex justify-center">
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  cardBox: "shadow-lg border border-soft-grey rounded-xl w-full",
                  card: "bg-white rounded-xl",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  formButtonPrimary:
                    "bg-primary-navy hover:bg-primary-navy/90 text-white transition-colors",
                  footerActionLink: "text-secondary-cyan hover:text-primary-navy",
                },
              }}
              forceRedirectUrl="/dashboard"
            />
          </div>

          <p className="text-center text-sm text-dark-grey/60">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-secondary-cyan hover:text-primary-navy transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
