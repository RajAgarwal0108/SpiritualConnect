"use client";

import { useAuthStore } from "@/store/globalStore";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, AlertTriangle, BarChart3, LogOut, BookOpen, PlusSquare, GraduationCap, Compass } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Seekers", icon: Users },
    { href: "/admin/communities", label: "Communities", icon: Compass },
    { href: "/admin/posts", label: "Reflections", icon: FileText },
    { href: "/admin/reports", label: "Moderation", icon: AlertTriangle },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/blogs", label: "Blogs", icon: PlusSquare },
    { href: "/admin/courses", label: "Courses", icon: GraduationCap },
  ];

  const handleExitPortal = () => {
    router.push("/");
  };

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/");
    }
  }, [user, router]);

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="flex h-screen bg-sacred-beige">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 bg-white border-r border-sacred-border flex-col">
        <div className="p-8">
          <h1 className="text-2xl font-serif font-bold text-sacred-gold tracking-tight">Sacred Admin</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1.5">
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const active = pathname?.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`flex items-center space-x-3 p-3.5 rounded-2xl transition-all group font-medium ${active ? "bg-sacred-gold/10 text-sacred-gold" : "hover:bg-sacred-gold/5 text-sacred-muted hover:text-sacred-gold"}`}>
                <Icon size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-4 pb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-sacred-muted/50">Content Management</div>
          {navItems.slice(2, 3).map((item) => {
            const Icon = item.icon;
            const active = pathname?.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`flex items-center space-x-3 p-3.5 rounded-2xl transition-all group font-medium ${active ? "bg-sacred-gold/10 text-sacred-gold" : "hover:bg-sacred-gold/5 text-sacred-muted hover:text-sacred-gold"}`}>
                <Icon size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          {/* <Link href="/admin/courses" className="flex items-center space-x-3 p-3.5 rounded-2xl hover:bg-sacred-gold/5 text-sacred-muted hover:text-sacred-gold transition-all group font-medium">
            <GraduationCap size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
            <span>Courses</span>
          </Link> */}
          <div className="pt-4 pb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-sacred-muted/50">System</div>
          {navItems.slice(3).map((item) => {
            const Icon = item.icon;
            const active = pathname?.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`flex items-center space-x-3 p-3.5 rounded-2xl transition-all group font-medium ${active ? "bg-sacred-gold/10 text-sacred-gold" : "hover:bg-sacred-gold/5 text-sacred-muted hover:text-sacred-gold"}`}>
                <Icon size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-6 border-t border-sacred-border">
          <button
            onClick={handleExitPortal}
            className="flex items-center space-x-3 p-3.5 w-full rounded-2xl hover:bg-red-50 text-sacred-muted hover:text-red-500 transition-all font-medium"
          >
            <LogOut size={20} strokeWidth={1.5} />
            <span>Exit Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#FDFCF9]">
        <div className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-sacred-border/60">
          <div className="px-3 h-14 flex items-center justify-between">
            <h1 className="text-lg font-serif font-bold text-sacred-gold tracking-tight">Sacred Admin</h1>
            <button onClick={handleExitPortal} className="text-xs font-bold uppercase tracking-widest text-sacred-muted px-3 py-1.5 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors">
              Exit
            </button>
          </div>
          <div className="px-2 pb-2 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 min-w-max">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname?.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${active ? "bg-sacred-gold text-white" : "bg-white text-sacred-muted border border-sacred-border hover:text-sacred-gold"}`}>
                    <Icon size={14} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
        <div className="p-3 md:p-12">
          <div className="max-w-7xl mx-auto">
          {children}
          </div>
        </div>
      </main>
    </div>
  );
}
