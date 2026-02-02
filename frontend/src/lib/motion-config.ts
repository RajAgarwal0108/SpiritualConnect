import { Variants, Transition } from "framer-motion";

/**
 * Sacred Easing: 
 * A slow, elegant, breathing cubic-bezier for a peaceful entrance.
 * Similar to 'overshoot-out' but tuned for serenity.
 */
export const SACRED_EASE = [0.16, 1, 0.3, 1] as const; 

export const BREATHING_TRANSITION: Transition = {
  duration: 1.2,
  ease: SACRED_EASE as any,
};

export const QUICK_TRANSITION: Transition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1] as any,
};

/**
 * Global Page Transitions
 * fade + y: 8px -> 0
 */
export const PAGE_VARIANTS: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: SACRED_EASE as any,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

/**
 * Card staggered entry variants
 */
export const STAGGER_CONTAINER: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const ITEM_VARIANTS: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: SACRED_EASE as any
    }
  },
};

export const FADE_IN_UP: Variants = {
  initial: { opacity: 0, y: 15 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: SACRED_EASE as any,
    },
  },
};

/**
 * Image zoom-in transition
 */
