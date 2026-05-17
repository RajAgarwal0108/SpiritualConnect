"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/globalStore";
import { AnimatePresence, motion } from "framer-motion";

const SplashScreen = dynamic(() => import("@/components/SplashScreen").then(m => ({ default: m.SplashScreen })));
const PageTransition = dynamic(() => import("@/components/ui/PageTransition").then(m => ({ default: m.PageTransition })), { ssr: false });
const LeftSidebar = dynamic(() => import("@/components/LeftSidebar"), { ssr: false });
const ChatSidebar = dynamic(() => import("@/components/ChatSidebar"), { ssr: false });

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const user = useAuthStore(s => s.user);
  const isLeftSidebarOpen = useUIStore(s => s.isLeftSidebarOpen);
  const setLeftSidebar = useUIStore(s => s.setLeftSidebar);
  const isRightSidebarOpen = useUIStore(s => s.isRightSidebarOpen);
  const setRightSidebar = useUIStore(s => s.setRightSidebar);
  const isChatExpanded = useUIStore(s => s.isChatExpanded);

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isAdminPage = pathname.startsWith("/admin");
  const isAuthenticated = !!user;
  const showSidebar = !isAuthPage && !isAdminPage && isAuthenticated;

  // Lock body scroll when chat is expanded
  useEffect(() => {
    if (isChatExpanded && isRightSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isChatExpanded, isRightSidebarOpen]);

  if (loading) {
    return <SplashScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <>
      {!isAdminPage && <Header />}

      {/* Global layout: main content only (sidebar floats on top) */}
      <div className={`${!isAuthPage && !isAdminPage ? 'max-w-7xl mx-auto px-6 py-8' : ''}`}>
        {/* Main content */}
        <PageTransition>{children}</PageTransition>

        {/* Desktop: floating sidebar (fixed position, overlays content) */}
        {showSidebar && (
          <AnimatePresence>
            {isLeftSidebarOpen && (
              <motion.div
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="hidden lg:block fixed left-6 top-24 w-72 z-60"
              >
                <div className="h-[calc(100vh-160px)] sticky top-24">
                  <LeftSidebar onClose={() => setLeftSidebar(false)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Mobile / overlay sidebar */}
        {showSidebar && (
          <AnimatePresence>
            {isLeftSidebarOpen && (
              <motion.aside
                initial={{ x: -280, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -280, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="lg:hidden fixed left-0 top-0 bottom-0 z-60 w-72"
              >
                <LeftSidebar onClose={() => setLeftSidebar(false)} />
              </motion.aside>
            )}
          </AnimatePresence>
        )}

        {/* Scrim when sidebar open */}
        {showSidebar && (
          <AnimatePresence>
            {(isLeftSidebarOpen || isRightSidebarOpen) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  setLeftSidebar(false);
                  setRightSidebar(false);
                }}
                className="fixed inset-0 z-55 bg-sacred-text/10"
                style={{ willChange: 'opacity' }}
              />
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Global Chat Sidebar (accessible on all pages when logged in and not on auth/admin) */}
      {showSidebar && user && (
        <AnimatePresence>
          {isRightSidebarOpen && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`fixed right-0 top-0 bottom-0 z-70 overflow-hidden shadow-2xl ${
                isChatExpanded 
                  ? "w-full left-0" 
                  : "w-full sm:w-105"
              }`}
              style={{ willChange: isRightSidebarOpen ? 'transform' : 'auto' }}
            >
              <ChatSidebar />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
