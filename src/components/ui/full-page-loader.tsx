"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface FullPageLoaderProps {
  loading?: boolean
  label?: string
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "primary" | "secondary"
  className?: string
  overlay?: boolean
}

const logoSizes = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-20 w-20",
  xl: "h-24 w-24",
}

export function FullPageLoader({
  loading = true,
  label = "Loading...",
  size = "lg",
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
            className="flex flex-col items-center gap-5 p-4"
          >
            <div className="relative flex items-center justify-center">
              {/* Outer Pulsing Ring */}
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                transition={{ rotate: { duration: 6, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
                className="absolute -inset-4 rounded-full border-2 border-dashed border-brand-primary/40"
              />
              <motion.div
                animate={{ scale: [1, 1.08, 1], filter: ["drop-shadow(0 0 10px rgba(59,130,246,0.4))", "drop-shadow(0 0 25px rgba(59,130,246,0.7))", "drop-shadow(0 0 10px rgba(59,130,246,0.4))"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className={cn("relative shrink-0 overflow-hidden", logoSizes[size])}
              >
                <Image
                  src="/collegelogo.png"
                  alt="College Logo Loading"
                  width={146}
                  height={108}
                  className="h-full w-full object-contain drop-shadow-md"
                  priority
                />
              </motion.div>
            </div>

            {label && (
              <motion.p
                className="text-sm font-extrabold tracking-wider text-foreground"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
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
