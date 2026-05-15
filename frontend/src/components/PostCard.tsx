"use client";

import { Post } from "@/types";
import Image from "next/image";
import { Heart, Share2, Bookmark, Send, MoreHorizontal, Sparkles, MessageCircle } from "lucide-react";
import { getMediaUrl } from "@/lib/media";
import { formatDistanceToNow } from "date-fns";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/globalStore";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuthStore();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState(post.comments || []);
  const [replyingTo, setReplyingTo] = useState<{ id: number; name: string } | null>(null);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);
  const [bookmarkCount, setBookmarkCount] = useState(post._count?.bookmarks || 0);
  const [commentCount, setCommentCount] = useState(post._count?.comments || 0);
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const commentInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch full comments when section is opened to ensure count and list are in sync
  useEffect(() => {
    if (showComments) {
      const fetchComments = async () => {
        try {
          const res = await api.get(`/posts/${post.id}`);
          if (res.data.comments) {
            setLocalComments(res.data.comments);
            setCommentCount(res.data._count?.comments || 0);
          }
        } catch (error) {
          console.error("Failed to fetch full comments:", error);
        }
      };
      fetchComments();
    }
  }, [showComments, post.id]);

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/posts/${post.id}/like`);
      return res.data;
    },
    onSuccess: (data) => {
      // Use data from backend if available for better sync
      if (data && typeof data.isLiked === 'boolean') {
        setIsLiked(data.isLiked);
        setLikeCount(data.likeCount);
      } else {
        // Fallback to local logic if backend response format is different
        setIsLiked(prev => !prev);
        setLikeCount(prev => (isLiked ? Math.max(prev - 1, 0) : prev + 1));
      }
      // Only invalidate specific queries to avoid over-fetching
      queryClient.invalidateQueries({ queryKey: ["communityPosts", post.communityId] });
    },
    onError: (error: any) => {
      console.error("Failed to like post:", error.response?.data?.message || error.message);
    }
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/posts/${post.id}/bookmark`);
      return res.data;
    },
    onSuccess: () => {
      setIsBookmarked(!isBookmarked);
      setBookmarkCount(prev => isBookmarked ? prev - 1 : prev + 1);
      // Only invalidate bookmarks query
      queryClient.invalidateQueries({ queryKey: ["bookmarkedPosts"] });
    },
    onError: (error: any) => {
      console.error("Failed to bookmark post:", error.response?.data?.message || error.message);
    }
  });

  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post(`/posts/${post.id}/comment`, { 
        content,
        parentId: replyingTo?.id || null
      });
      return res.data;
    },
    onSuccess: (newComment) => {
      const enriched = replyingTo ? { ...newComment, parentId: replyingTo.id } : newComment;
      setLocalComments(prev => [...prev, enriched]);
      if (newComment.commentCount !== undefined) {
        setCommentCount(newComment.commentCount);
      } else {
        setCommentCount(prev => prev + 1);
      }
      setCommentText("");
      setReplyingTo(null);
    },
    onError: (error: any) => {
      console.error("Failed to post comment:", error.response?.data?.message || error.message);
      alert("Failed to post comment. Please try again.");
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const res = await api.delete(`/posts/${post.id}/comments/${commentId}`);
      return res.data;
    },
    onSuccess: (data, commentId) => {
      // remove the comment and its descendants locally
      const getIdsToRemove = (comments: any[], targetId: number): Set<number> => {
        const idsToRemove = new Set<number>();
        const collect = (id: number, list: any[]) => {
          idsToRemove.add(id);
          list.filter(c => c.parentId === id).forEach(child => collect(child.id, list));
        };
        collect(targetId, comments);
        return idsToRemove;
      };

      setLocalComments(prev => {
        const idsToRemove = getIdsToRemove(prev, commentId);
        if (data?.commentCount !== undefined) {
          setCommentCount(data.commentCount);
        } else {
          setCommentCount(count => Math.max(0, count - idsToRemove.size));
        }
        return prev.filter(c => !idsToRemove.has(c.id));
      });
    },
    onError: (error: any) => {
      console.error("Failed to delete comment:", error.response?.data?.message || error.message);
      alert("Failed to delete comment. Please try again.");
    }
  });

  // Memoized handlers to prevent unnecessary re-renders
  const handleLike = useCallback(() => {
    if (likeMutation.isPending) return;
    likeMutation.mutate();
  }, [likeMutation]);

  const handleBookmark = useCallback(() => {
    if (!bookmarkMutation.isPending) {
      bookmarkMutation.mutate();
    }
  }, [bookmarkMutation]);

  const handleCommentSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || createCommentMutation.isPending) return;
    createCommentMutation.mutate(commentText);
  }, [commentText, createCommentMutation]);

  // Memoized values
  const formattedTime = useMemo(() => 
    formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }),
    [post.createdAt]
  );

  const authorInitial = useMemo(() => post.author.name[0], [post.author.name]);

  const mediaUrl = useMemo(() => {
    if (!post.media) return null;
    return getMediaUrl(post.media);
  }, [post.media]);

  const isVideoMedia = useMemo(() => {
    if (!post.media) return false;
    return /\.(mp4|webm|ogg|mov|quicktime)(\?|$)/i.test(post.media);
  }, [post.media]);

  // Auto-pause video when it leaves the viewport
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && !video.paused) {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [videoRef]);

  return (
    <motion.div 
      className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-lg hover:bg-white/90 group/post"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="p-4 md:p-6 pb-3 md:pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <Link href={`/profile/${post.author.id}`} className="shrink-0 group">
              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-linear-to-br from-sacred-gold/20 to-sacred-gold/40 flex items-center justify-center overflow-hidden border-2 border-white/60 shadow-sm group-hover:shadow-md transition-all duration-300">
                  {post.author.profile?.avatar ? (
                    <Image 
                      src={getMediaUrl(post.author.profile.avatar) as string} 
                      alt={post.author.name} 
                      width={48}
                      height={48}
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-lg font-bold text-sacred-gold">
                      {authorInitial}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
              </div>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link 
                  href={`/profile/${post.author.id}`}
                  className="font-semibold text-sacred-text hover:text-sacred-gold transition-colors duration-200"
                >
                  {post.author.name}
                </Link>
                 {'role' in post.author && post.author.role === 'ADMIN' && (
                   <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-sacred-gold/10 border border-sacred-gold/20 flex items-center justify-center">
                        <Sparkles size={10} className="text-sacred-gold" />
                      </div>
                   </div>
                )}
                <span className="text-sacred-muted/60">•</span>
                <span className="text-sm text-sacred-muted">
                  {formattedTime}
                </span>
              </div>
              {post.community && (
                <div className="mt-0.5">
                   <Link 
                    href={`/communities/${post.community.id}`}
                    className="text-sm text-sacred-muted hover:text-sacred-gold transition-colors duration-200"
                  >
                    in {post.community.name}
                  </Link>
                </div>
              )}
            </div>
          </div>
          <button className="text-sacred-muted hover:text-sacred-gold transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 pb-4">
        {post.content && (
          <div className="prose prose-sacred max-w-none mb-4">
            <p className="text-sacred-text leading-[1.8] font-serif text-base md:text-lg">
              {post.content}
            </p>
          </div>
        )}

        {/* Media */}
        {post.media && (
          <div className="rounded-2xl overflow-hidden shadow-md bg-black/95 border border-sacred-border/20 group/media relative">
            {isVideoMedia ? (
              <video 
                ref={videoRef}
                src={mediaUrl || ""} 
                controls 
                className="w-full h-auto max-h-[70vh] object-contain"
                preload="metadata"
                playsInline
              />
            ) : (
              <Image 
                src={mediaUrl || ""} 
                alt="Sacred Media" 
                width={800}
                height={450}
                className="w-full h-auto max-h-[70vh] object-contain transition-transform duration-500 group-hover/media:scale-[1.01]"
                loading="lazy"
              />
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 md:px-6 py-3 md:py-4 border-t border-sacred-border/10 bg-white/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Like Button */}
            <motion.button 
              onClick={handleLike}
              disabled={likeMutation.isPending}
              className="group flex items-center gap-2 outline-none"
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart 
                  size={22} 
                  className={`transition-all duration-200 ${
                    isLiked 
                      ? "text-red-500 fill-red-500" 
                      : "text-sacred-text group-hover:text-red-500 group-hover:scale-110"
                  }`} 
                />
              </motion.div>
              {likeCount > 0 && (
                <span className={`text-sm font-semibold transition-colors duration-200 ${
                  isLiked ? "text-red-500" : "text-sacred-text"
                }`}>
                  {likeCount}
                </span>
              )}
            </motion.button>

            {/* Comment Button */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="group flex items-center gap-2 outline-none"
            >
              <MessageCircle size={22} className="text-sacred-text transition-all group-hover:text-sacred-gold group-hover:scale-110" />
              {commentCount > 0 && (
                <span className="text-sm font-semibold text-sacred-text">{commentCount}</span>
              )}
            </button>

            {/* Share Button */}
            <button className="group flex items-center gap-2 outline-none">
              <Share2 size={22} className="text-sacred-text transition-all group-hover:text-sacred-gold group-hover:scale-110" />
            </button>
          </div>

          {/* Bookmark Button */}
          <motion.button 
            onClick={handleBookmark}
            disabled={bookmarkMutation.isPending}
            className="group flex items-center gap-2 outline-none"
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={isBookmarked ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Bookmark 
                size={22} 
                className={`transition-all duration-200 ${
                  isBookmarked 
                    ? "text-sacred-gold fill-sacred-gold" 
                    : "text-sacred-text group-hover:text-sacred-gold group-hover:scale-110"
                }`} 
              />
            </motion.div>
            {bookmarkCount > 0 && (
              <span className={`text-sm font-semibold transition-colors duration-200 ${
                isBookmarked ? "text-sacred-gold" : "text-sacred-text"
              }`}>
                {bookmarkCount}
              </span>
            )}
          </motion.button>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-sacred-border/10 bg-white/40"
          >
            <div className="px-4 md:px-6 py-4 space-y-4">
              {/* Existing Comments */}
              <div className="space-y-4">
                {localComments && localComments.length > 0 ? (
                  localComments.filter(c => !c.parentId).map((comment: any) => (
                    <div key={comment.id} className="flex gap-3 group/comment">
                      <Link href={`/profile/${comment.author.id}`} className="shrink-0">
                        <div className="w-9 h-9 rounded-xl overflow-hidden border border-sacred-border/20 shadow-sm">
                           {getMediaUrl(comment.author.profile?.avatar) ? (
                             <Image src={getMediaUrl(comment.author.profile?.avatar) as string} alt={comment.author.name} width={36} height={36} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full bg-sacred-gold/10 flex items-center justify-center font-bold text-sacred-gold">
                               {comment.author.name[0]}
                             </div>
                           )}
                        </div>
                      </Link>
                      <div className="flex-1 bg-white/50 rounded-2xl p-3 border border-white/60">
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/profile/${comment.author.id}`} className="font-semibold text-sm text-sacred-text hover:text-sacred-gold transition-colors">
                            {comment.author.name}
                          </Link>
                          <span className="text-[10px] text-sacred-muted italic">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-sacred-text/90 leading-relaxed font-serif">
                           {comment.content}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                           <button className="text-[11px] font-semibold text-sacred-gold/70 hover:text-sacred-gold transition-colors">
                             Reply
                           </button>
                           {user?.id === comment.author.id && (
                             <button onClick={() => deleteCommentMutation.mutate(comment.id)} className="text-[11px] font-semibold text-red-400 hover:text-red-500 transition-colors">
                               Delete
                             </button>
                           )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                     <p className="text-sm text-sacred-muted italic font-serif">Awaiting your resonance...</p>
                  </div>
                )}
              </div>

              {/* Comment Input */}
              <form onSubmit={handleCommentSubmit} className="flex gap-3 pt-4 border-t border-white/40">
                <div className="w-9 h-9 rounded-xl bg-sacred-gold/10 flex items-center justify-center shrink-0 border border-sacred-gold/20">
                  <span className="text-xs font-bold text-sacred-gold uppercase">
                    {user?.name?.[0] || 'Y'}
                  </span>
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    ref={commentInputRef}
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your insights..."
                    className="flex-1 bg-white/70 border border-white/50 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sacred-gold/20 focus:border-sacred-gold/40 transition-all font-serif placeholder:italic"
                  />
                  <button 
                     type="submit"
                     disabled={!commentText.trim() || createCommentMutation.isPending}
                     className="p-2 text-sacred-gold hover:scale-110 active:scale-95 transition-all disabled:opacity-30"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

