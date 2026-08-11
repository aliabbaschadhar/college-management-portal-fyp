"use client";

import React from "react";

interface PraxisLabBadgeProps {
  className?: string;
  showAgencyTag?: boolean;
}

export function PraxisLabBadge({ className = "", showAgencyTag = false }: PraxisLabBadgeProps) {
  return (
    <a
      href="https://praxislabs.framer.website/"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2.5 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/60 shadow-xs hover:shadow-md transition-all duration-300 group hover:scale-105 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/praxislab.svg"
        alt="Praxis Lab Emblem"
        className="h-4 w-auto object-contain dark:hidden transition-transform group-hover:rotate-6 shrink-0"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/praxislab_dark.svg"
        alt="Praxis Lab Emblem"
        className="h-4 w-auto object-contain hidden dark:block transition-transform group-hover:rotate-6 shrink-0"
      />
      <span className="text-xs font-bold text-foreground leading-none">
        Built &amp; Developed by <strong className="font-black text-brand-primary dark:text-blue-400 text-xs sm:text-sm">Praxis Lab</strong>
      </span>
      {showAgencyTag && (
        <span className="text-[10px] bg-brand-primary text-white font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-xs group-hover:bg-blue-600 leading-none">
          Agency
        </span>
      )}
    </a>
  );
}
