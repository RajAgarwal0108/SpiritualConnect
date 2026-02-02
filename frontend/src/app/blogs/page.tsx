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
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-5xl font-serif font-bold text-sacred-text">Wisdom Chronicles</h1>
          <p className="text-sacred-muted italic text-xl">Long-form reflections on the spiritual journey.</p>
        </div>
        {user ? (
          <Link href="/blogs/create">
            <div className="group relative">
              <Button className="bg-sacred-gold hover:bg-sacred-gold/90 text-white rounded-2xl px-8 py-6 h-auto text-lg font-serif transition-all duration-300 hover:shadow-lg hover:shadow-sacred-gold/20">
                <PlusCircle size={22} className="mr-3" />
                Share Your Wisdom
              </Button>
            </div>
          </Link>
        ) : (
          <Link href="/login">
            <Button className="bg-transparent border border-sacred-gold text-sacred-gold font-serif rounded-xl px-6">
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
        <div className="text-center py-20 bg-sacred-beige/20 rounded-4xl border-2 border-dashed border-sacred-gold/10">
          <FileText className="mx-auto text-sacred-gold/20 mb-6" size={60} />
          <h2 className="text-2xl font-serif font-bold text-sacred-text">No chronicles found</h2>
          <p className="text-sacred-muted mt-2 mb-8">Be the first to share your spiritual insights with the sangha.</p>
          <Link href="/blogs/create">
            <Button className="bg-transparent border border-sacred-gold text-sacred-gold hover:bg-sacred-gold hover:text-white rounded-xl">
              Create First Post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {blogs.map((blog, idx) => (
            <motion.div 
              key={blog.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link href={`/blogs/${blog.id}`}>
                <div className="group bg-white/60 backdrop-blur-md rounded-4xl border border-sacred-gold/10 hover:border-sacred-gold/30 hover:shadow-2xl hover:shadow-sacred-gold/5 transition-all duration-500 cursor-pointer overflow-hidden relative flex flex-col md:flex-row">
                  {blog.coverImage && (
                    <div className="md:w-64 h-48 md:h-auto shrink-0 overflow-hidden">
                      <img 
                        src={getMediaUrl(blog.coverImage) || ""} 
                        alt={blog.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                    </div>
                  )}
                  
                  <div className="p-8 md:p-10 flex-1 space-y-4">
                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowRight className="text-sacred-gold" size={32} />
                    </div>
                    
                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <span className="bg-sacred-gold/10 text-sacred-gold px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                          {blog.category}
                        </span>
                        <span className="text-sacred-muted text-xs">•</span>
                        <span className="text-sacred-muted text-xs font-medium flex items-center gap-1">
                          <Clock size={12} /> {blog.readTime}
                        </span>
                      </div>

                      <h2 className="text-3xl font-serif font-bold text-sacred-text group-hover:text-sacred-gold transition-colors leading-tight">
                        {blog.title}
                      </h2>
                      
                      <p className="text-sacred-muted text-lg font-serif leading-relaxed line-clamp-2">
                        {blog.excerpt}
                      </p>

                      <div className="flex items-center justify-between pt-6 border-t border-sacred-gold/5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-sacred-gold/10 flex items-center justify-center text-sacred-gold border border-sacred-gold/20 overflow-hidden">
                            {blog.author.profile?.avatar ? (
                              <img src={getMediaUrl(blog.author.profile.avatar) || ""} alt={blog.author.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-bold">{blog.author.name[0]}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-sacred-text">{blog.author.name}</p>
                            <p className="text-[10px] text-sacred-muted uppercase tracking-widest">
                              {new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-xs font-bold text-sacred-muted/60 uppercase tracking-widest flex gap-4">
                          <span>{blog._count.comments} Comments</span>
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
