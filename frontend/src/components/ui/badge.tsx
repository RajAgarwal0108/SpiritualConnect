"use client";

import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "outline";
  className?: string;
}

export const Badge = ({ children, variant = "default", className = "" }: BadgeProps) => {
  const variants: Record<string, string> = {
    default: "inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FBF7E9] text-[#B8860B]",
    outline: "inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-transparent border border-[#E9D6A8] text-[#84662A]",
  };

  return <span className={`${variants[variant]} ${className}`}>{children}</span>;
};

export default Badge;
