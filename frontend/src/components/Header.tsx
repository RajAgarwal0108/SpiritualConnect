"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/globalStore";
import { usePathname } from "next/navigation";
import { Bell, MessageCircle, ShieldCheck, Menu, HeartHandshake } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/uiStore";
import { getMediaUrl } from "@/lib/media";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useNotifications } from "@/hooks/useNotifications";
import { useConversationsList } from "@/hooks/useConversations";

export default function Header() {
  const { user, logout } = useAuthStore();
  const { toggleRightSidebar, isRightSidebarOpen, toggleLeftSidebar, isLeftSidebarOpen } = useUIStore();
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { socket } = useChatSocket();
  const {
    notifications,
    unreadCount,
    markAllRead,
    refetchNotifications,
    refetchUnreadCount,
  } = useNotifications(socket, !!user && !isAuthPage);
  const { data: conversations = [] } = useConversationsList(user?.id);
  const dmUnreadTotal = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setNotificationOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setNotificationOpen(false);
      }
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

  const formatNotification = (notification: typeof notifications[number]) => {
    const actorName = notification.actor?.name || "Someone";

    switch (notification.type) {
      case "FOLLOW":
        return { label: `${actorName} connected with you`, href: `/profile/${notification.actorId}` };
      case "BLOG_PUBLISHED":
        return { label: `${actorName} published a new blog`, href: `/blogs/${notification.targetId}` };
      case "POST_LIKED":
        return { label: `${actorName} liked your post`, href: `/posts/${notification.targetId}` };
      case "POST_COMMENTED":
        return { label: `${actorName} commented on your post`, href: `/posts/${notification.targetId}` };
      case "BLOG_COMMENTED":
        return { label: `${actorName} commented on your blog`, href: `/blogs/${notification.targetId}` };
      case "MESSAGE_RECEIVED":
        if (notification.targetType === "GUIDANCE_SESSION") {
          return { label: `${actorName} sent a message in your guidance session`, href: `/guidance/session/${notification.targetId}` };
        }
        return { label: `${actorName} sent you a message`, href: `/chat?userId=${notification.actorId}` };
      case "GUIDANCE_REQUESTED":
        return { label: `${actorName} requested guidance`, href: "/profile/guidance" };
      case "GUIDANCE_ACCEPTED":
        return { label: "Your guidance request was accepted", href: `/guidance/session/${notification.targetId}` };
      case "GUIDANCE_REJECTED":
        return { label: "Your guidance request was declined", href: "/profile/guidance" };
      case "GUIDANCE_UPDATED":
        return { label: "Guidance session updated", href: `/guidance/session/${notification.targetId}` };
      default:
        return { label: "You have a new update", href: "/" };
    }
  };

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
            <Image src="/file.svg" alt="SpiritualConnect" width={32} height={32} className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" />
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
              <div className="relative">
                <button 
                  onClick={toggleRightSidebar}
                  className={`p-1.5 md:p-2 rounded-xl transition-all duration-300 flex items-center justify-center ${isRightSidebarOpen ? 'bg-sacred-gold text-white shadow-lg shadow-sacred-gold/20' : 'hover:bg-sacred-gold/10 text-sacred-muted hover:text-sacred-gold'}`}
                  title="Conversations"
                >
                  <MessageCircle className={`w-5 h-5 md:w-6 md:h-6 ${isRightSidebarOpen ? 'scale-110' : ''}`} />
                  <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.2em] hidden md:inline">Conversations</span>
                </button>
                {dmUnreadTotal > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {dmUnreadTotal > 9 ? "9+" : dmUnreadTotal}
                  </span>
                )}
              </div>
            )}

            {user && !isAuthPage && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={async () => {
                    const next = !notificationOpen;
                    setNotificationOpen(next);
                    if (next) {
                      await refetchNotifications();
                      const { data } = await refetchUnreadCount();
                      const latestCount = typeof data === "number" ? data : unreadCount;
                      if (latestCount > 0) {
                        await markAllRead();
                      }
                    }
                  }}
                  className="p-1.5 md:p-2 rounded-xl transition-all duration-300 flex items-center justify-center hover:bg-sacred-gold/10 text-sacred-muted hover:text-sacred-gold relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5 md:w-6 md:h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {notificationOpen && (
                  <div className="absolute right-0 top-10 w-[92vw] max-w-sm md:w-96 bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-sacred-border/20 flex items-center justify-between">
                      <p className="text-sm font-semibold text-sacred-text">Notifications</p>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-sacred-muted">Recent</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-sacred-muted">
                          Your sanctuary is quiet for now.
                        </div>
                      ) : (
                        notifications.map((notification) => {
                          const { label, href } = formatNotification(notification);
                          const isUnread = !notification.readAt;
                          return (
                            <Link
                              key={notification.id}
                              href={href}
                              onClick={() => setNotificationOpen(false)}
                              className={`flex items-start gap-3 px-4 py-3 border-b border-sacred-border/10 hover:bg-sacred-beige/30 transition-colors ${isUnread ? "bg-sacred-gold/5" : ""}`}
                            >
                              <div className="shrink-0">
                                {notification.actor?.profile?.avatar ? (
                                  <Image
                                    src={getMediaUrl(notification.actor.profile.avatar) as string}
                                    alt={notification.actor?.name || "User"}
                                    width={32}
                                    height={32}
                                    className="w-8 h-8 rounded-full object-cover border border-sacred-border"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-sacred-gold/10 flex items-center justify-center text-sacred-gold font-bold text-[10px] border border-sacred-gold/20">
                                    {(notification.actor?.name || "U")[0]}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-sacred-text leading-snug">{label}</p>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-sacred-muted mt-1">
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {user?.role === 'ADMIN' && (
              <Link 
                href="/admin/dashboard" 
                className="hidden md:flex p-1.5 md:p-2 rounded-xl hover:bg-sacred-gold/10 text-sacred-gold transition-all duration-300 items-center justify-center group"
                title="Admin Dashboard"
              >
                <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110" />
                <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.2em] hidden lg:inline">Admin</span>
              </Link>
            )}

            {user && (
              <Link 
                href="/profile/guidance" 
                className="hidden md:flex p-1.5 md:p-2 rounded-xl hover:bg-sacred-gold/10 text-sacred-gold transition-all duration-300 items-center justify-center group"
                title="Guidance Dashboard"
              >
                <HeartHandshake className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110" />
                <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.2em] hidden lg:inline">Guidance</span>
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
                    <Image
                      src={getMediaUrl(user.profile.avatar) as string}
                      alt={user.name}
                      width={32}
                      height={32}
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
                    <Link
                      href="/profile/guidance"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-sacred-text hover:bg-sacred-beige/30"
                    >
                      <HeartHandshake size={16} />
                      Guidance
                    </Link>
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
