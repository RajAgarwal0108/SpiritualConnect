"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { Loader2, ArrowLeft, Clock, User, Share2, MessageCircle, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/globalStore";
import { getMediaUrl } from "@/lib/media";

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: {
    name: string;
    profile?: { avatar?: string };
  };
}

interface Blog {
  id: number;
  title: string;
  content: string;
  category: string;
  readTime: string;
  createdAt: string;
  coverImage?: string;
  author: {
    id: number;
    name: string;
    profile?: { avatar?: string; bio?: string };
  };
  comments: Comment[];
  _count: {
    comments: number;
  };
}

export default function BlogDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");

  const { data: blog, isLoading } = useQuery<Blog>({
    queryKey: ["blog", id],
    queryFn: async () => {
      const res = await api.get(`/blogs/${id}`);
      return res.data;
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post(`/blogs/${id}/comments`, { content });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog", id] });
      setCommentText("");
      alert("Reflection added to the chronicle.");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to add reflection.");
    }
  });

  const deleteBlogMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/blogs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      alert("Chronicle deleted.");
      router.push("/blogs");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to delete chronicle.");
    }
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || commentMutation.isPending) return;
    commentMutation.mutate(commentText);
  };

  if (isLoading) return (
    <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-sacred-gold" size={40} />
      <p className="text-sacred-muted font-serif italic">Opening the ancient scrolls...</p>
    </div>
  );

  if (!blog) return (
    <div className="h-[70vh] flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-serif text-sacred-text">Chronicled Lost in Time</h1>
      <Button onClick={() => router.push("/blogs")} variant="ghost" className="text-sacred-gold hover:bg-sacred-gold/10">
        Return to Wisdom Chronicles
      </Button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 pb-32">
       <div className="flex items-center justify-between mb-12">
          <button 
           onClick={() => router.back()}
           className="flex items-center gap-2 text-sacred-muted hover:text-sacred-gold transition-colors group"
         >
           <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
           <span className="font-serif italic text-lg text-sacred-muted">Back to Chronicles</span>
         </button>

         {(user?.id === blog.author.id || user?.role === 'ADMIN') && (
           <button 
            onClick={() => confirm("Are you sure you want to remove this reflection forever?") && deleteBlogMutation.mutate()}
            disabled={deleteBlogMutation.isPending}
            className="p-3 rounded-2xl hover:bg-red-50 text-sacred-muted hover:text-red-500 transition-all flex items-center gap-2 group"
           >
             <span className="text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Delete Chronicle</span>
             <Trash2 size={20} />
           </button>
         )}
       </div>

      <article className="space-y-12">
        {/* Cover Image */}
        {blog.coverImage && (
          <div className="rounded-4xl overflow-hidden aspect-21/9 border border-sacred-gold/10 shadow-2xl shadow-sacred-gold/5">
            <img src={getMediaUrl(blog.coverImage) || ""} alt={blog.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Header */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <span className="bg-sacred-gold/10 text-sacred-gold px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
              {blog.category}
            </span>
            <span className="text-sacred-muted text-xs">•</span>
            <span className="text-sacred-muted text-xs font-medium flex items-center gap-1">
              <Clock size={12} /> {blog.readTime}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-serif font-bold text-sacred-text leading-tight tracking-tight">
            {blog.title}
          </h1>

          <div className="flex items-center justify-between py-8 border-y border-sacred-gold/5">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 rounded-2xl bg-sacred-gold/10 flex items-center justify-center text-sacred-gold border border-sacred-gold/20 overflow-hidden">
                {blog.author.profile?.avatar ? (
                  <img src={getMediaUrl(blog.author.profile.avatar) || ""} alt={blog.author.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold">{blog.author.name[0]}</span>
                )}
              </div>
              <div>
                <p className="text-lg font-bold text-sacred-text leading-none mb-1">{blog.author.name}</p>
                <p className="text-sm italic text-sacred-muted">
                   Published on {new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
               <button className="p-3 rounded-2xl hover:bg-sacred-gold/5 text-sacred-muted hover:text-sacred-gold transition-all">
                  <Share2 size={24} />
               </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg prose-sacred max-w-none">
          <div className="text-sacred-text font-serif leading-relaxed space-y-8 text-xl">
             {blog.content.split('\n').map((para, i) => (
               <p key={i}>{para}</p>
             ))}
          </div>
        </div>

        {/* Author Bio (Optional) */}
        <div className="mt-20 p-8 md:p-12 rounded-4xl bg-sacred-beige/20 border border-sacred-gold/5 flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
           <div className="shrink-0 w-24 h-24 rounded-3xl bg-sacred-gold/10 flex items-center justify-center text-sacred-gold border-2 border-sacred-gold/10 overflow-hidden shadow-lg shadow-sacred-gold/5">
             {blog.author.profile?.avatar ? (
                <img src={getMediaUrl(blog.author.profile.avatar) || ""} alt={blog.author.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold">{blog.author.name[0]}</span>
              )}
           </div>
           <div className="space-y-2">
              <h4 className="text-xl font-serif font-bold text-sacred-text">Written from the heart of {blog.author.name}</h4>
              <p className="text-sacred-muted italic">
                {blog.author.profile?.bio || "A seeker on the path, sharing reflections from the journey within."}
              </p>
           </div>
        </div>

        {/* Comments Section */}
        <div className="pt-20 space-y-12">
           <div className="flex items-center gap-4 border-b border-sacred-gold/10 pb-6">
              <h3 className="text-3xl font-serif font-bold text-sacred-text flex items-center gap-4">
                 <MessageCircle className="text-sacred-gold" size={32} />
                 Reflections
                 <span className="text-lg text-sacred-muted/40 font-sans">({blog._count.comments})</span>
              </h3>
           </div>

           {/* Add Comment Form */}
           <form onSubmit={handleSubmitComment} className="relative group">
              <textarea 
                placeholder="Share your reflection on these words..."
                className="w-full bg-white border border-sacred-gold/10 hover:border-sacred-gold/30 rounded-3xl px-8 py-6 min-h-37.5 outline-none focus:ring-4 focus:ring-sacred-gold/5 transition-all font-serif text-lg text-sacred-text shadow-sm"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <div className="absolute bottom-6 right-6">
                <Button 
                  type="submit" 
                  disabled={!commentText.trim() || commentMutation.isPending}
                  className="bg-sacred-gold hover:bg-sacred-gold/90 text-white rounded-2xl px-6 py-4 h-auto disabled:opacity-50 transition-all duration-300 shadow-lg shadow-sacred-gold/10"
                >
                  {commentMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="mr-2" />}
                  {commentMutation.isPending ? "" : "Share Insight"}
                </Button>
              </div>
           </form>

           {/* Comments List */}
           <div className="space-y-8 mt-12">
              {blog.comments.length === 0 ? (
                <div className="text-center py-12 text-sacred-muted italic space-y-4">
                   <p className="text-xl">The reflection pond is still.</p>
                   <p className="text-sm">Be the first to share your thoughts.</p>
                </div>
              ) : (
                blog.comments.map((comment, idx) => (
                  <motion.div 
                    key={comment.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex gap-6 p-8 rounded-[35px] bg-white border border-sacred-gold/5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-sacred-gold/10 flex items-center justify-center text-sacred-gold border border-sacred-gold/20 overflow-hidden">
                      {comment.author.profile?.avatar ? (
                        <img src={getMediaUrl(comment.author.profile.avatar) || ""} alt={comment.author.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold">{comment.author.name[0]}</span>
                      )}
                    </div>
                    <div className="space-y-2 flex-1">
                       <div className="flex items-center justify-between">
                          <h5 className="font-bold text-sacred-text">{comment.author.name}</h5>
                          <span className="text-[10px] uppercase font-bold text-sacred-muted tracking-widest">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                       </div>
                       <p className="text-sacred-text leading-relaxed font-serif italic text-lg opacity-90">
                          {comment.content}
                       </p>
                    </div>
                  </motion.div>
                ))
              )}
           </div>
        </div>
      </article>
    </div>
  );
}
