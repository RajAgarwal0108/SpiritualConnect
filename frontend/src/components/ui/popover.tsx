"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";

interface PopoverContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const PopoverContext = React.createContext<PopoverContextType | undefined>(undefined);

export const Popover = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block" ref={popoverRef}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

export const PopoverTrigger = ({ children, asChild = false }: { children: React.ReactNode; asChild?: boolean }) => {
  const context = React.useContext(PopoverContext);
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        context?.setOpen(!context.open);
        if ((children as React.ReactElement<any>).props.onClick) {
          (children as React.ReactElement<any>).props.onClick(e);
        }
      }
    });
  }

  return (
    <div 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        context?.setOpen(!context?.open);
      }}
      className="inline-block cursor-pointer"
    >
      {children}
    </div>
  );
};

export const PopoverContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const context = React.useContext(PopoverContext);
  
  if (!context?.open) return null;

  return (
    <div className={`absolute right-0 mt-2 min-w-[220px] bg-white rounded-2xl p-3 border shadow-lg z-50 ${className}`}>
      {children}
    </div>
  );
};

export default Popover;
