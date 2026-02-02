"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import { ITEM_VARIANTS, SACRED_EASE } from "@/lib/motion-config";

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card = ({ children, className = "", hoverable = true }: CardProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={ITEM_VARIANTS}
      whileHover={
        hoverable && !shouldReduceMotion
          ? {
              y: -6,
              boxShadow: "0 20px 40px -10px rgba(92, 84, 69, 0.08)",
              transition: { duration: 0.7, ease: SACRED_EASE as any },
            }
          : {}
      }
      className={`
        glass-panel
        rounded-4xl shadow-sm transition-all duration-700
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};
