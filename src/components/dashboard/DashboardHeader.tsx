"use client";

import { Bell, Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
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

      {/* Right section */}
      <div className="ml-auto flex items-center gap-3">

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
