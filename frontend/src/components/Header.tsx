"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/globalStore";
import { usePathname } from "next/navigation";
import { User, LogOut, Home, Compass, MessageCircle, Bell, Sparkles, BookOpen, ShieldCheck, Users, Search, X, MessageSquare, Menu } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/uiStore";
import { motion, AnimatePresence } from "framer-motion";
import { SACRED_EASE } from "@/lib/motion-config";
import { getMediaUrl } from "@/lib/media";

export default function Header() {
  const { user, logout } = useAuthStore();
  const { toggleRightSidebar, isRightSidebarOpen, toggleLeftSidebar, isLeftSidebarOpen } = useUIStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Don't show header on admin pages (they have their own sidebar)
  if (pathname.startsWith("/admin")) return null;

  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <header className="glass-panel sticky top-0 z-50 border-b-0">
      <div className="max-w-8xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
        {/* Left: Menu Toggle + Logo + Essence */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {!isLeftSidebarOpen && !isAuthPage && (
            <button 
              onClick={toggleLeftSidebar}
              className="p-1.5 md:p-2 rounded-xl transition-colors flex items-center justify-center hover:bg-sacred-beige text-sacred-muted"
              title="Open Navigation"
            >
              <Menu size={20} className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          )}
          
          <Link href="/" className="flex items-center font-serif text-lg md:text-xl font-semibold text-sacred-gold tracking-tight shrink-0">
            <img src="/file.svg" alt="SpiritualConnect" className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" />
            <span className="hidden sm:inline">SpiritualConnect</span>
          </Link>
          <span className="hidden lg:block h-4 w-px bg-sacred-border" />
          <span className="hidden lg:block text-[10px] uppercase tracking-[0.2em] text-sacred-muted font-bold">A Sanctuary</span>
        </div>

        {/* Right: Actions */}
        {mounted ? (
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Chat Toggle Button */}
            {user && !isAuthPage && (
              <button 
                onClick={toggleRightSidebar}
                className={`p-1.5 md:p-2 rounded-xl transition-all duration-300 flex items-center justify-center ${isRightSidebarOpen ? 'bg-sacred-gold text-white shadow-lg shadow-sacred-gold/20' : 'hover:bg-sacred-gold/10 text-sacred-muted hover:text-sacred-gold'}`}
                title="Conversations"
              >
                <MessageCircle className={`w-5 h-5 md:w-6 md:h-6 ${isRightSidebarOpen ? 'scale-110' : ''}`} />
                <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.2em] hidden md:inline">Conversations</span>
              </button>
            )}

            {user?.role === 'ADMIN' && (
              <Link 
                href="/admin/dashboard" 
                className="p-1.5 md:p-2 rounded-xl hover:bg-sacred-gold/10 text-sacred-gold transition-all duration-300 flex items-center justify-center group"
                title="Admin Dashboard"
              >
                <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110" />
                <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.2em] hidden lg:inline">Admin</span>
              </Link>
            )}

            {user ? (
              <div className="relative flex items-center space-x-2 md:space-x-3 pl-2 border-l border-sacred-border" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((s) => !s)}
                  className="flex items-center gap-2 focus:outline-none"
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                >
                  {user.profile?.avatar ? (
                    <img
                      src={getMediaUrl(user.profile.avatar) as string}
                      alt={user.name}
                      className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover border border-sacred-border"
                    />
                  ) : (
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-sacred-gold/10 flex items-center justify-center text-sacred-gold font-bold text-[10px] border border-sacred-gold/20">
                      {user.name[0]}
                    </div>
                  )}
                </button>

                {/* Simple dropdown menu */}
                {menuOpen && (
                  <div className="absolute right-0 top-10 w-44 bg-white/80 backdrop-blur-md border border-white/30 rounded-2xl shadow-lg z-50 overflow-hidden">
                    {user?.role === 'ADMIN' && (
                      <Link 
                        href="/admin/dashboard" 
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-sacred-gold font-semibold hover:bg-sacred-gold/10 transition-colors border-b border-sacred-border/10"
                      >
                        <ShieldCheck size={16} />
                        Admin Panel
                      </Link>
                    )}
                    <Link href="/settings/account" className="block px-4 py-3 text-sm text-sacred-text hover:bg-sacred-beige/30">Settings</Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                        router.push('/login');
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              pathname === "/login" ? (
                <Link href="/register" className="text-[12px] md:text-sm font-bold bg-sacred-gold/10 text-sacred-gold hover:bg-sacred-gold hover:text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-all duration-300 ml-1 md:ml-2 whitespace-nowrap">
                  Sign Up
                </Link>
              ) : (
                <Link href="/login" className="text-[12px] md:text-sm font-bold bg-sacred-gold/10 text-sacred-gold hover:bg-sacred-gold hover:text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-all duration-300 ml-1 md:ml-2 whitespace-nowrap">
                  Log in
                </Link>
              )
            )}
          </div>
        ) : (
          <div className="h-8 md:h-10 w-8 md:w-10" />
        )}
      </div>
    </header>
  );
}
