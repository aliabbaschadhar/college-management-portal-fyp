"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center bg-primary-navy text-white p-12">
        <div className="max-w-md text-center space-y-6">
          <div className="flex justify-center">
            <Image
              src="/logo.svg"
              alt="College Management Portal logo"
              width={146}
              height={108}
              className="h-16 w-16 object-contain"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Join Our College Community
          </h1>
          <p className="text-lg text-blue-200 leading-relaxed">
            Create your account and get instant access to all academic
            resources, course management, and collaborative tools.
          </p>
          <div className="space-y-3 pt-6 text-left">
            {[
              { title: "Students", desc: "Access courses, grades & schedules" },
              { title: "Faculty", desc: "Manage classes, quizzes & attendance" },
              { title: "Administrators", desc: "Oversee admissions, records & analytics" },
            ].map((role) => (
              <div
                key={role.title}
                className="rounded-lg bg-white/10 px-5 py-3 flex items-center gap-3"
              >
                <div className="h-2 w-2 rounded-full bg-secondary-cyan flex-shrink-0" />
                <div>
                  <span className="font-semibold">{role.title}</span>
                  <span className="text-blue-200 text-sm ml-2">
                    — {role.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Sign Up Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-light-blue px-4 py-12">
        {/* Mobile Logo */}
        <div className="mb-8 flex flex-col items-center lg:hidden">
          <Image
            src="/logo.svg"
            alt="College Management Portal logo"
            width={146}
            height={108}
            className="mb-2 h-10 w-10 object-contain"
            priority
          />
          <h1 className="text-2xl font-bold text-primary-navy">
            College Management Portal
          </h1>
        </div>

        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-dark-grey">
              Create Your Account
            </h2>
            <p className="text-dark-grey/70 mt-1">
              Get started with your college portal access
            </p>
          </div>

          <div className="flex justify-center">
            <SignUp
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
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-semibold text-secondary-cyan hover:text-primary-navy transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
