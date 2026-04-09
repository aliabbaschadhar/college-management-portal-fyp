"use client"

import { TopiLoader } from "./topi-loader"

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "primary" | "secondary" | "white"
  className?: string
}

export function Spinner({ size = "md", variant = "primary", className }: SpinnerProps) {
  return <TopiLoader size={size} variant={variant} className={className} />
}
