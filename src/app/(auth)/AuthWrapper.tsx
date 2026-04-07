"use client";

import { motion } from "framer-motion";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative z-10 w-full max-w-md"
    >
      {children}
    </motion.div>
  );
}
