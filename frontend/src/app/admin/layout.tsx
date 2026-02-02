"use client";

import { useAuthStore } from "@/store/globalStore";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, FileText, AlertTriangle, BarChart3, LogOut, BookOpen, PlusSquare, GraduationCap, Compass } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/");
    }
  }, [user, router]);

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="flex h-screen bg-sacred-beige">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-sacred-border flex flex-col">
        <div className="p-8">
          <h1 className="text-2xl font-serif font-bold text-sacred-gold tracking-tight">Sacred Admin</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1.5">
          <Link href="/admin/dashboard" className="flex items-center space-x-3 p-3.5 rounded-2xl hover:bg-sacred-gold/5 text-sacred-muted hover:text-sacred-gold transition-all group font-medium">
            <LayoutDashboard size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/users" className="flex items-center space-x-3 p-3.5 rounded-2xl hover:bg-sacred-gold/5 text-sacred-muted hover:text-sacred-gold transition-all group font-medium">
            <Users size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
            <span>Seekers</span>
          </Link>
          <div className="pt-4 pb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-sacred-muted/50">Content Management</div>
          <Link href="/admin/communities" className="flex items-center space-x-3 p-3.5 rounded-2xl hover:bg-sacred-gold/5 text-sacred-muted hover:text-sacred-gold transition-all group font-medium">
            <Compass size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
            <span>Communities</span>
          </Link>
          <Link href="/admin/courses" className="flex items-center space-x-3 p-3.5 rounded-2xl hover:bg-sacred-gold/5 text-sacred-muted hover:text-sacred-gold transition-all group font-medium">
            <GraduationCap size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
            <span>Courses</span>
          </Link>
          <div className="pt-4 pb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-sacred-muted/50">System</div>
          <Link href="/admin/posts" className="flex items-center space-x-3 p-3.5 rounded-2xl hover:bg-sacred-gold/5 text-sacred-muted hover:text-sacred-gold transition-all group font-medium">
            <FileText size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
            <span>Reflections</span>
          </Link>
          <Link href="/admin/reports" className="flex items-center space-x-3 p-3.5 rounded-2xl hover:bg-sacred-gold/5 text-sacred-muted hover:text-sacred-gold transition-all group font-medium">
            <AlertTriangle size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
            <span>Moderation</span>
          </Link>
          <Link href="/admin/analytics" className="flex items-center space-x-3 p-3.5 rounded-2xl hover:bg-sacred-gold/5 text-sacred-muted hover:text-sacred-gold transition-all group font-medium">
            <BarChart3 size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
            <span>Analytics</span>
          </Link>
        </nav>
        <div className="p-6 border-t border-sacred-border">
          <button onClick={logout} className="flex items-center space-x-3 p-3.5 w-full rounded-2xl hover:bg-red-50 text-sacred-muted hover:text-red-500 transition-all font-medium">
            <LogOut size={20} strokeWidth={1.5} />
            <span>Exit Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-12 bg-[#FDFCF9]">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
