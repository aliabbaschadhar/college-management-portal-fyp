"use client"

import { motion, AnimatePresence } from "framer-motion"
import { TopiLoader } from "./topi-loader"
import { cn } from "@/lib/utils"

interface FullPageLoaderProps {
  loading?: boolean
  label?: string
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "primary" | "secondary"
  className?: string
  overlay?: boolean
}

export function FullPageLoader({
  loading = true,
  label = "Loading...",
  size = "lg",
  variant = "primary",
  className,
  overlay = false,
}: FullPageLoaderProps) {
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "flex items-center justify-center",
            overlay
              ? "fixed inset-0 z-50 bg-brand-dark/50 backdrop-blur-sm"
              : "min-h-screen w-full",
            className
          )}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="flex flex-col items-center gap-4 rounded-xl bg-card p-8 shadow-lg"
          >
            <TopiLoader size={size} variant={variant} />
            {label && (
              <motion.p
                className="text-sm font-medium text-foreground"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {label}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
