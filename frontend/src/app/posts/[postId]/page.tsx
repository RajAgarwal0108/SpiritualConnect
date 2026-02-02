"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { Loader2, Heart, MessageSquare, Share2, CornerDownRight, Send, Sparkles, MoreHorizontal, Bookmark } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/globalStore";
import { getMediaUrl } from "@/lib/media";
import { motion, AnimatePresence } from "framer-motion";
import { SACRED_EASE, FADE_IN_UP, STAGGER_CONTAINER } from "@/lib/motion-config";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function PostDetailsPage() {
  const { postId } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState("");

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const res = await api.get(`/posts/${postId}`);
      return res.data;
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post(`/posts/${postId}/comment`, { content });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      setCommentContent("");
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/posts/${postId}/like`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || commentMutation.isPending) return;
    commentMutation.mutate(commentContent);
  };

  if (isLoading) return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-sacred-gold" size={40} /></div>;
  if (!post) return <div className="text-center py-32 text-sacred-muted font-serif italic">The reflection has faded... (Post not found)</div>;

  return (
    <main className="max-w-2xl mx-auto py-16 px-4">
      <motion.div
        initial="initial"
        animate="animate"
        variants={FADE_IN_UP}
      >
        <Card className="p-0 overflow-hidden border-sacred-border/50 group shadow-xl">
          {/* Post Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-sacred-beige/50">
            <Link href={`/profile/${post.author.id}`} className="flex items-center space-x-3">
              <div className="relative p-px rounded-full bg-linear-to-tr from-sacred-gold to-sacred-gold-dark/20">
                <div className="w-10 h-10 rounded-full bg-white p-[1.5px]">
                  <div className="w-full h-full rounded-full bg-sacred-beige overflow-hidden flex items-center justify-center text-sacred-gold font-medium border border-sacred-border">
                    {post.author.profile?.avatar ? (
                      <img 
                        src={getMediaUrl(post.author.profile.avatar) as string} 
                        alt={post.author.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">{post.author.name[0]}</span>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-sacred-text leading-none">{post.author.name}</h3>
                <p className="text-[9px] uppercase tracking-widest text-sacred-muted/60 mt-1 font-bold">Resonating Truth</p>
              </div>
            </Link>
            <button className="text-sacred-muted/30 hover:text-sacred-muted transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* Post Media / Content */}
          <div className="bg-[#FDFCF9]">
            {post.media && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full bg-sacred-beige/20 border-b border-sacred-beige/30"
              >
                <img 
                  src={getMediaUrl(post.media) as string} 
                  alt="Post media" 
                  className="w-full h-auto object-contain max-h-[70vh] mx-auto"
                />
              </motion.div>
            )}

            <div className="p-8">
              <p className="text-xl text-sacred-text font-serif leading-relaxed italic border-l-2 border-sacred-gold/30 pl-6">
                {post.content}
              </p>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="px-6 py-4 flex items-center justify-between border-t border-sacred-beige/50">
            <div className="flex items-center space-x-6">
              <motion.button 
                whileTap={{ scale: 0.8 }}
                onClick={() => likeMutation.mutate()}
                disabled={likeMutation.isPending}
                className={`transition-all duration-300 ${post._count.likes > 0 ? "text-red-500" : "text-sacred-text hover:text-sacred-muted"}`}
              >
                <Heart size={26} strokeWidth={1.5} className={post._count.likes > 0 ? "fill-red-500 stroke-red-500" : ""} />
              </motion.button>
              <div className="text-sacred-text">
                <MessageSquare size={26} strokeWidth={1.5} />
              </div>
              <button className="text-sacred-text hover:text-sacred-muted transition-colors">
                <Share2 size={26} strokeWidth={1.5} />
              </button>
            </div>
            <button className="text-sacred-text hover:text-sacred-gold transition-colors">
              <Bookmark size={26} strokeWidth={1.5} />
            </button>
          </div>

          <div className="px-8 pb-6">
            <p className="text-sm font-bold text-sacred-text mb-4">
              {post._count.likes} souls and hearts in resonance
            </p>

            <div className="space-y-8 mt-10">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-sacred-gold/50" />
                <h4 className="text-[10px] font-bold text-sacred-muted/60 uppercase tracking-[0.2em]">Sacred Reflections</h4>
              </div>
              
              <div className="space-y-6">
                {post.comments?.map((comment: any) => (
                  <div key={comment.id} className="flex space-x-4">
                    <div className="w-8 h-8 rounded-full bg-sacred-beige overflow-hidden flex items-center justify-center text-sacred-gold font-medium text-xs border border-sacred-border shrink-0">
                      {comment.author?.profile?.avatar ? (
                        <img 
                          src={getMediaUrl(comment.author.profile.avatar) as string} 
                          alt={comment.author.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        comment.author?.name[0] || "?"
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-sacred-text">{comment.author?.name}</span>
                        <span className="text-[9px] text-sacred-muted/40 font-bold uppercase tracking-tighter">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-sacred-muted mt-1 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Input Area */}
          <div className="border-t border-sacred-beige/50 p-4">
            {user ? (
              <form onSubmit={handleCommentSubmit} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-sacred-gold/10 flex items-center justify-center text-sacred-gold font-bold text-[10px]">
                  {user.name[0]}
                </div>
                <input 
                  type="text" 
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Share your resonance..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-sacred-muted/30 text-sacred-text"
                />
                <button 
                  type="submit"
                  disabled={!commentContent.trim() || commentMutation.isPending}
                  className="text-sacred-gold text-xs font-bold uppercase tracking-widest disabled:opacity-30"
                >
                  {commentMutation.isPending ? "..." : "Post"}
                </button>
              </form>
            ) : (
              <p className="text-xs text-center text-sacred-muted/50 italic">Log in to join the conversation</p>
            )}
          </div>
        </Card>
      </motion.div>
    </main>
  );
}
