"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { motion } from "framer-motion";
import { FileText, Clock, User, PlusCircle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/globalStore";
import { getMediaUrl } from "@/lib/media";

interface Blog {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  coverImage?: string;
  createdAt: string;
  author: {
    id: number;
    name: string;
    profile?: { avatar?: string };
  };
  _count: {
    comments: number;
  };
}

export default function BlogsPage() {
  const { user } = useAuthStore();
  const { data: blogs = [], isLoading } = useQuery<Blog[]>({
    queryKey: ["blogs"],
    queryFn: async () => {
      const res = await api.get("/blogs");
      return res.data;
    },
  });

  return (
    <div className="max-w-5xl mx-auto py-8 md:py-16 px-4 md:px-8 space-y-10 md:space-y-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 text-center md:text-left">
        <div className="space-y-4 md:space-y-6">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-sacred-text tracking-tight">Wisdom Chronicles</h1>
          <p className="text-sacred-muted italic text-lg md:text-2xl max-w-2xl mx-auto md:mx-0 leading-relaxed font-serif">Long-form reflections on the spiritual journey.</p>
        </div>
        {user ? (
          <Link href="/blogs/create" className="w-full md:w-auto">
            <Button className="w-full md:w-auto bg-sacred-gold hover:bg-sacred-gold/90 text-white rounded-full px-10 py-4 h-auto text-base md:text-lg font-serif transition-all duration-300">
              <PlusCircle size={20} className="mr-3" />
              Share Wisdom
            </Button>
          </Link>
        ) : (
          <Link href="/login" className="w-full md:w-auto">
            <Button className="w-full md:w-auto bg-transparent border border-sacred-gold/30 text-sacred-gold font-serif rounded-full px-8 py-3">
              Sign in to share wisdom
            </Button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-sacred-gold" size={40} />
          <p className="text-sacred-muted font-serif italic">Gathering insights...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-24 bg-sacred-beige/5 rounded-[40px] border border-dashed border-sacred-gold/10">
          <FileText className="mx-auto text-sacred-gold/20 mb-6" size={60} />
          <h2 className="text-2xl font-serif font-bold text-sacred-text">No chronicles found</h2>
          <p className="text-sacred-muted italic mb-8">Be the first to share your spiritual insights with the sangha.</p>
          <Link href="/blogs/create">
            <Button className="bg-transparent border border-sacred-gold/40 text-sacred-gold hover:bg-sacred-gold hover:text-white rounded-full px-8 py-2.5">
              Create First Post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12 md:gap-20">
          {blogs.map((blog, idx) => (
            <motion.div 
              key={blog.id} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={`/blogs/${blog.id}`}>
                <div className="group transition-all duration-700 cursor-pointer overflow-hidden relative flex flex-col md:flex-row gap-6 md:gap-12">
                  {blog.coverImage && (
                    <div className="w-full md:w-80 h-64 md:h-80 shrink-0 overflow-hidden rounded-[32px] md:rounded-[48px] shadow-sm group-hover:shadow-xl transition-all duration-700">
                      <img 
                        src={getMediaUrl(blog.coverImage) || ""} 
                        alt={blog.title} 
                        className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-4 md:space-y-6 py-2">
                    <div className="space-y-4 md:space-y-6 relative z-10">
                      <div className="flex items-center gap-4 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-sacred-gold/60">
                        <span>{blog.category}</span>
                        <span className="w-1 h-1 bg-sacred-gold/30 rounded-full" />
                        <span>{blog.readTime}</span>
                      </div>

                      <h2 className="text-2xl md:text-5xl font-serif font-bold text-sacred-text group-hover:text-sacred-gold transition-colors duration-500 leading-tight md:leading-[1.15]">
                        {blog.title}
                      </h2>
                      
                      <p className="hidden md:block text-sacred-muted text-lg font-serif leading-relaxed line-clamp-2 opacity-80 italic">
                        {blog.excerpt}
                      </p>

                      <div className="flex items-center justify-between pt-6 md:pt-8 border-t border-sacred-gold/5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-sacred-gold/10 overflow-hidden transition-all duration-500 group-hover:scale-105">
                            {blog.author.profile?.avatar ? (
                              <img src={getMediaUrl(blog.author.profile.avatar) || ""} alt={blog.author.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-sacred-beige flex items-center justify-center text-sacred-gold font-serif">
                                {blog.author.name[0]}
                              </div>
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-sm font-bold text-sacred-text">{blog.author.name}</p>
                            <p className="text-[10px] text-sacred-muted/60 uppercase tracking-[0.2em] font-bold">
                              {new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        <div className="md:hidden">
                           <ArrowRight size={18} className="text-sacred-gold/40" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
