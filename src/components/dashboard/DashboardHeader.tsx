"use client";

import { Bell, Menu, Search } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "./ThemeToggle";

interface DashboardHeaderProps {
  roleLabel: string;
  onMenuClick: () => void;
}

export function DashboardHeader({ roleLabel, onMenuClick }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 backdrop-blur-md px-4 lg:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card hover:bg-accent transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Search bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-9 rounded-lg border border-border bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Role badge */}
        <span className="hidden md:inline-flex items-center rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
          {roleLabel}
        </span>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button
          className="relative h-9 w-9 rounded-lg border border-border bg-card flex items-center justify-center hover:bg-accent transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-system-danger text-[9px] font-bold text-white">
            3
          </span>
        </button>

        {/* User button */}
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-9 w-9 ring-2 ring-brand-primary/20",
            },
          }}
        />
      </div>
    </header>
  );
}
