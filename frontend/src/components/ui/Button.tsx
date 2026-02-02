"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import { SACRED_EASE } from "@/lib/motion-config";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

export const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
}: ButtonProps) => {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    primary: "bg-linear-to-r from-sacred-gold to-sacred-gold-dark text-white shadow-md hover:shadow-lg",
    secondary: "bg-white border border-sacred-border text-sacred-text hover:bg-sacred-beige",
    ghost: "bg-transparent text-sacred-text hover:bg-sacred-beige",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -1 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
      transition={{ duration: 0.25, ease: SACRED_EASE as any }}
      className={`
        relative px-6 py-3 rounded-2xl font-medium tracking-tight overflow-hidden
        transition-colors focus:outline-none focus:ring-2 focus:ring-[#D9A05B]/30
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {/* Subtle Ripple/Glow Effect */}
      <span className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity" />
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};
