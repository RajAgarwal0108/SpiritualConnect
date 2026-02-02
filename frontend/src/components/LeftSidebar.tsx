"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { Home as HomeIcon, Users, Compass, Sliders, ChevronLeft, BookOpen, Sparkles, FileText, LucideIcon } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/globalStore";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface LeftSidebarProps {
  onClose: () => void;
}

export default function LeftSidebar({ onClose }: LeftSidebarProps) {
  const { user } = useAuthStore();
  const pathname = usePathname();
  
  const { data: joinedCommunities = [] } = useQuery({
    queryKey: ["joinedCommunities"],
    queryFn: async () => {
      const res = await api.get("/communities/joined");
      return res.data;
    },
    enabled: !!user,
  });
  const navLinks = [
    { name: "Sacred Home", href: "/", icon: HomeIcon },
    { name: "Explore People", href: "/explore/people", icon: Users },
    { name: "Communities", href: "/explore", icon: Compass, exact: true },
    { name: "AI Assistant", href: "/ai-assistant", icon: Sparkles },
    { name: "Courses", href: "/courses", icon: BookOpen },
    { name: "Blogs", href: "/blogs", icon: FileText },
    { name: "Settings", href: "/settings/account", icon: Sliders },
  ];

  return (
    <div className="flex flex-col h-full bg-white/60 backdrop-blur-xl border border-white/40 rounded-[32px] shadow-sm overflow-hidden">
      {/* Make the scrolling region explicitly scrollable while keeping the footer fixed */}
      <div className="p-6 space-y-8 flex-1 overflow-y-auto no-scrollbar">
        {/* User Mini Profile */}
        {user && (
          <Link href={`/profile/${user.id}`} className="block">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 border border-sacred-gold/5 shadow-xs relative group hover:border-sacred-gold/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sacred-gold text-white flex items-center justify-center font-serif font-bold group-hover:scale-105 transition-transform shadow-md shadow-sacred-gold/10">
                {user.name[0]}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-sm truncate text-sacred-text">{user.name}</h3>
                <p className="text-[9px] uppercase tracking-widest text-sacred-gold font-bold opacity-70 italic">Vedic Seeker</p>
              </div>
            </div>
          </Link>
        )}

        <nav className="space-y-1">
          {navLinks.map((link) => {
            // For exact matches (like Communities at /explore), only highlight if pathname matches exactly
            // For others, use startsWith to handle nested routes
            const isActive = link.exact 
              ? pathname === link.href 
              : (pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)));
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group relative ${
                  isActive 
                    ? "bg-sacred-gold text-white shadow-lg shadow-sacred-gold/20" 
                    : "text-sacred-text hover:bg-sacred-gold/10 hover:text-sacred-gold"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute inset-0 bg-sacred-gold rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <link.icon size={20} className={isActive ? "text-white" : "text-sacred-muted group-hover:text-sacred-gold transition-colors"} />
                <span className={`font-medium text-sm ${isActive ? "font-bold" : ""}`}>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Communities Section */}
        <div className="space-y-4 pt-4 border-t border-sacred-gold/10">
          <div className="px-4 flex items-center justify-between">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-sacred-muted">My Sanghas</h4>
            <Link href="/explore" className="text-[10px] text-sacred-gold hover:underline font-bold">Discover</Link>
          </div>
          <div className="space-y-1 max-h-[25vh] overflow-y-auto no-scrollbar pr-1">
            {joinedCommunities.map((community: any) => {
              const commActive = pathname === `/communities/${community.id}`;
              return (
                <Link
                  key={community.id}
                  href={`/communities/${community.id}`}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm group ${
                    commActive ? "bg-sacred-beige text-sacred-gold font-bold" : "text-sacred-text hover:bg-sacred-gold/5"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold transition-colors ${
                    commActive ? "bg-sacred-gold text-white" : "bg-sacred-beige text-sacred-gold group-hover:bg-sacred-gold/10"
                  }`}>
                     {community.name[0]}
                  </div>
                  <span className="truncate flex-1">{community.name}</span>
                </Link>
              );
            })}
            {joinedCommunities.length === 0 && (
                <p className="px-4 text-xs italic text-sacred-muted/60 py-2 font-serif">Awaiting your first circle.</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-sacred-gold/10 flex justify-between items-center bg-sacred-beige/10">
        <p className="text-[10px] text-sacred-muted/50 font-serif italic">
          Sacred Link v1.0
        </p>
        <button onClick={onClose} className="p-2 hover:bg-sacred-gold/10 rounded-full transition-colors text-sacred-muted/40 hover:text-sacred-gold group">
           <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
