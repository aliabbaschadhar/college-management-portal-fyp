"use client";

import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  trend: string;
  trendDirection: "up" | "down";
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

export function StatsCard({
  title,
  value,
  trend,
  trendDirection,
  icon: Icon,
  iconColor,
  iconBg,
}: StatsCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-lg hover:shadow-brand-primary/5 hover:border-brand-primary/20">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          <div className="flex items-center gap-1.5">
            {trendDirection === "up" ? (
              <TrendingUp className="h-3.5 w-3.5 text-system-success" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-system-danger" />
            )}
            <span
              className={cn(
                "text-xs font-semibold",
                trendDirection === "up" ? "text-system-success" : "text-system-danger"
              )}
            >
              {trend}
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </div>

        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="h-6 w-6" style={{ color: iconColor }} />
        </div>
      </div>

      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}
