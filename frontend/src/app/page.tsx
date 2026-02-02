"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuthStore } from "@/store/globalStore";
import { Loader2, BookOpen, Users, Sparkles, ArrowRight, PlayCircle, BookMarked, Compass, X, Menu } from "lucide-react";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import { Button } from "@/components/ui/Button";

const FEATURED_COURSES = [
  { id: 1, title: "Foundations of Vedic Breathwork", instructor: "Sri Ananda", price: "Free", duration: "4 Modules", rating: 4.9 },
  { id: 2, title: "Intro to Advaita Vedanta", instructor: "Swami Ji", price: "Premium", duration: "12 Lessons", rating: 5.0 },
];

interface BlogPreview {
  id: number;
  title: string;
  excerpt: string;
  category?: string;
  readTime?: string;
}

export default function Home() {
  const { user } = useAuthStore();
  const router = useRouter();

  const { data: joinedCommunities = [], isLoading: commsLoading } = useQuery({
    queryKey: ["joinedCommunities"],
    queryFn: async () => {
      const res = await api.get("/communities/joined");
      return res.data || [];
    },
    enabled: !!user,
  });

  const { data: blogs = [], isLoading: blogsLoading } = useQuery<BlogPreview[]>({
    queryKey: ["homeBlogs"],
    queryFn: async () => {
      const res = await api.get("/blogs");
      return res.data || [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 text-sacred-muted">
        <Loader2 className="animate-spin text-sacred-gold" size={36} />
        <p className="font-serif italic">Redirecting to sign in...</p>
      </div>
    );
  }

  if (commsLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <Loader2 className="animate-spin text-sacred-gold" size={40} />
      </div>
    );
  }

  return (
    <div className="relative bg-sacred-beige/10 text-sacred-text">
      {/* --- Main Content --- */}
      <main className="flex-1 relative scroll-smooth">
        <div className="max-w-4xl mx-auto py-4 space-y-20">
          
          {/* Welcome Hero */}
          <section className="text-left space-y-4 pt-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-sacred-gold bg-sacred-gold/5 px-4 py-1.5 rounded-full border border-sacred-gold/10">Sanctuary Home</span>
              <h1 className="font-serif text-6xl font-bold tracking-tight text-sacred-text mt-6 leading-[1.1]">
                Peace be with you, <br/>
                <span className="text-sacred-gold">{user?.name?.split(' ')[0] || 'Seeker'}</span>
              </h1>
              <p className="text-sacred-muted italic text-xl mt-4 max-w-lg leading-relaxed">
                Your spiritual journey continues. Reconnect with your intention and find your center.
              </p>
            </motion.div>
          </section>

          {/* Communities Section */}
          <section className="space-y-8">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-sacred-gold/10 rounded-[20px] text-sacred-gold shadow-sm">
                  <Users size={28} />
                </div>
                <div>
                  <h2 className="text-3xl font-serif font-bold tracking-tight">Joined Sanghas</h2>
                  <p className="text-sm text-sacred-muted italic">Reconnect with your spiritual circles</p>
                </div>
              </div>
              <Link href="/explore" className="text-sacred-gold hover:text-sacred-text text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors">
                Explore <Compass size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {joinedCommunities.length > 0 ? (
                joinedCommunities.slice(0, 4).map((community: any, i: number) => (
                  <motion.div
                    key={community.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link href={`/communities/${community.id}`}>
                      <div className="bg-white/60 backdrop-blur-xl rounded-4xl p-8 border border-white shadow-sm hover:shadow-2xl hover:shadow-sacred-gold/5 transition-all group flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-sacred-beige flex items-center justify-center text-3xl font-bold text-sacred-gold group-hover:scale-110 transition-transform shadow-sm">
                          {community.name[0]}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-serif text-2xl font-bold text-sacred-text group-hover:text-sacred-gold transition-colors">{community.name}</h3>
                          <p className="text-[10px] uppercase tracking-widest text-sacred-muted font-bold opacity-60">Active Sanctuary</p>
                        </div>
                        <ArrowRight className="text-sacred-gold opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" size={20} />
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="col-span-full py-20 text-center bg-white/30 rounded-4xl border border-dashed border-sacred-border"
                >
                  <p className="italic text-sacred-muted text-lg font-serif">You haven't joined any circles yet.</p>
                  <Link href="/explore">
                    <Button variant="ghost" className="mt-6 text-sacred-gold hover:bg-sacred-gold/5 px-8 rounded-full border border-sacred-gold/20">Find your Sangha</Button>
                  </Link>
                </motion.div>
              )}
            </div>
          </section>

          {/* Courses Section */}
          <section className="space-y-6">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sacred-gold/10 rounded-xl text-sacred-gold">
                   <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold">Sacred Pathways</h2>
                  <p className="text-sm text-sacred-muted italic">Master the ancient arts</p>
                </div>
              </div>
              <Link href="/courses" className="text-sacred-gold hover:underline text-sm font-medium">View all courses</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FEATURED_COURSES.map((course, i) => (
                <motion.div 
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/60 backdrop-blur-xl rounded-4xl overflow-hidden border border-white hover:border-sacred-gold/20 shadow-sm transition-all hover:shadow-2xl hover:shadow-sacred-gold/10 group cursor-pointer"
                >
                  <div className="h-40 bg-sacred-beige/30 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-sacred-gold/5 via-transparent to-sacred-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <PlayCircle size={48} className="text-sacred-gold/30 group-hover:text-sacred-gold group-hover:scale-110 transition-all duration-500" />
                  </div>
                  <div className="p-8 space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-sacred-gold px-3 py-1 bg-sacred-gold/10 rounded-lg">{course.duration}</span>
                       <div className="flex items-center gap-1 text-[10px] font-bold text-sacred-muted/60 uppercase">
                         <span className="w-1 h-1 bg-sacred-gold rounded-full" />
                         ★ {course.rating}
                       </div>
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-sacred-text group-hover:text-sacred-gold transition-colors">{course.title}</h3>
                    <p className="text-sm text-sacred-muted italic font-medium">with {course.instructor}</p>
                    <div className="pt-2">
                      <Button className="w-full rounded-2xl bg-sacred-gold hover:bg-sacred-text text-white border-none text-xs font-bold py-6 shadow-lg shadow-sacred-gold/10 transition-all duration-500">
                        {course.price === 'Free' ? 'Begin Free Path' : 'Enroll in Course'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Blogs Section */}
          <section className="space-y-8 pb-32">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-sacred-gold/10 rounded-[20px] text-sacred-gold shadow-sm">
                  <BookOpen size={28} />
                </div>
                <div>
                  <h2 className="text-3xl font-serif font-bold tracking-tight">Wisdom Chronicles</h2>
                  <p className="text-sm text-sacred-muted italic">Timeless insights for the modern seeker</p>
                </div>
              </div>
              <Link href="/blogs" className="text-sacred-gold hover:text-sacred-text text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors">
                Library <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {blogsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <Loader2 className="animate-spin text-sacred-gold" size={32} />
                  <p className="text-sacred-muted italic">Gathering the latest chronicles...</p>
                </div>
              ) : blogs.length > 0 ? (
                blogs.slice(0, 3).map((blog) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                  >
                    <Link href={`/blogs/${blog.id}`}>
                      <div className="group bg-white/40 hover:bg-white backdrop-blur-xl rounded-4xl p-10 border border-white hover:border-sacred-gold/10 shadow-sm transition-all hover:shadow-2xl hover:shadow-sacred-gold/5 relative overflow-hidden flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-10">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                              {blog.category && (
                                <span className="text-[9px] uppercase font-black tracking-widest text-white bg-sacred-gold px-3 py-1 rounded-md">
                                  {blog.category}
                                </span>
                              )}
                              {blog.readTime && (
                                <span className="text-[10px] uppercase font-bold text-sacred-muted/40 tracking-widest">
                                  {blog.readTime}
                                </span>
                              )}
                            </div>
                            <h3 className="text-3xl font-serif font-bold group-hover:text-sacred-gold transition-colors leading-snug">
                              {blog.title}
                            </h3>
                            <p className="text-sacred-muted italic text-lg leading-relaxed line-clamp-2 font-serif opacity-80">
                              {blog.excerpt}
                            </p>
                          </div>
                          <div className="shrink-0">
                            <Button
                              variant="ghost"
                              className="rounded-full w-14 h-14 p-0 items-center justify-center border-sacred-gold/20 text-sacred-gold hover:bg-sacred-gold hover:text-white transition-all duration-500"
                            >
                              <ArrowRight size={24} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-16 bg-sacred-beige/20 rounded-4xl border-2 border-dashed border-sacred-gold/10">
                  <BookOpen className="mx-auto text-sacred-gold/20 mb-6" size={48} />
                  <h3 className="text-2xl font-serif font-bold text-sacred-text">No chronicles yet</h3>
                  <p className="text-sacred-muted mt-2 mb-6 font-serif italic">Start the library with your own wisdom.</p>
                  <Link href="/blogs/create">
                    <Button className="bg-sacred-gold text-white hover:bg-sacred-text rounded-full px-6">
                      Share the first story
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </section>

        </div>
      </main>

    </div>
  );
}

