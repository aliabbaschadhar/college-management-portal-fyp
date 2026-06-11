"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error securely
    console.error("Dashboard component crash:", error);
  }, [error]);

  const isDbError =
    error?.message?.includes("database") ||
    error?.message?.includes("Prisma") ||
    error?.message?.includes("connect") ||
    error?.message?.includes("ECONNREFUSED") ||
    error?.message?.includes("unavailable");

  return (
    <div className="min-h-[75vh] w-full flex items-center justify-center p-6 relative">
      {/* Container */}
      <div className="relative w-full max-w-lg bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/10 dark:border-slate-800/80 rounded-2xl p-8 shadow-xl text-center flex flex-col items-center">
        {/* Animated Icon Container */}
        <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400 mb-6 animate-pulse">
          <AlertTriangle className="w-7 h-7" />
        </div>

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 mb-3 font-outfit">
          {isDbError ? "Dashboard Connection Temporarily Interrupted" : "Failed to Load Dashboard Module"}
        </h2>

        {/* Description */}
        <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
          {isDbError
            ? "We are unable to connect to the database. Some actions or pages may be temporarily unavailable. Please try again."
            : "An unexpected error occurred while loading this dashboard view. Your other data remains fully safe."}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full max-w-xs">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md transition-all duration-200 cursor-pointer active:scale-98 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Module
          </button>
          
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white font-medium rounded-xl transition-all duration-200 cursor-pointer active:scale-98 text-sm"
          >
            <Home className="w-4 h-4" />
            Main Dashboard
          </Link>
        </div>

        {/* Footer info code */}
        {error.digest && (
          <div className="mt-6 pt-4 border-t border-slate-800/40 w-full text-left">
            <span className="text-[9px] tracking-wider text-slate-500 block uppercase mb-1">
              Error Digest
            </span>
            <code className="text-xs bg-slate-950/80 py-1 px-2.5 rounded border border-slate-800/60 block text-slate-400 select-all overflow-x-auto whitespace-nowrap scrollbar-thin">
              {error.digest}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
