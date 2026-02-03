"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { SACRED_EASE } from "@/lib/motion-config";

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 600); // Wait for fade out
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-[#FDFCF9]"
        >
          {/* Subtle Radial Gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,160,91,0.03)_0%,transparent_70%)]" />

          <div className="relative text-center">
            {/* Logo / Sacred Symbol */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: SACRED_EASE as any }}
              className="mb-8"
            >
              {/* Use the new spiritual SVG logo from public folder */}
              <img src="/file.svg" alt="SpiritualConnect" className="w-24 h-24 mx-auto shadow-2xl rounded-full bg-white/0" />
            </motion.div>

            {/* Sanskrit Inspired Tagline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1.2, ease: SACRED_EASE as any }}
            >
              <h1 className="text-2xl font-light text-sacred-text tracking-[0.2em] uppercase mb-2">
                SpiritualConnect
              </h1>
              <p className="text-sacred-muted font-serif italic text-sm tracking-wide">
                "Finding peace in every breath"
              </p>
            </motion.div>

            {/* Subtle Drifting Particles */}
            <motion.div 
              animate={{ 
                y: [0, -20, 0],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -top-12 -left-12 w-64 h-64 bg-sacred-gold/5 rounded-full blur-3xl pointer-events-none"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
