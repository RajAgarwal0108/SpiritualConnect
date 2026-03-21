"use client";

import * as React from "react";

interface PopoverProps {
  children: React.ReactNode;
}

export const Popover = ({ children }: PopoverProps) => {
  return <div className="relative inline-block">{children}</div>;
};

export const PopoverTrigger = ({ children, asChild = false }: { children: React.ReactNode; asChild?: boolean }) => {
  return <>{children}</>;
};

export const PopoverContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`absolute right-0 mt-2 min-w-[220px] bg-white rounded-2xl p-3 border shadow-lg z-50 ${className}`}>
      {children}
    </div>
  );
};

export default Popover;
