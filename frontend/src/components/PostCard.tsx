"use client";

import { Post } from "@/types";
import { Heart, MessageCircle, Share2, Bookmark, Send, Trash2 } from "lucide-react";
import { getMediaUrl } from "@/lib/media";
import { formatDistanceToNow } from "date-fns";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
      className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-lg hover:bg-white/90"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/profile/${post.author.id}`} className="shrink-0 group">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-sacred-gold/20 to-sacred-gold/40 flex items-center justify-center overflow-hidden border-2 border-white/60 shadow-sm group-hover:shadow-md transition-all duration-300">
                  {post.author.profile?.avatar ? (
                    <img 
                      src={getMediaUrl(post.author.profile.avatar) as string} 
                      alt={post.author.name} 
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
              <Link 
                href={`/profile/${post.author.id}`}
                className="font-semibold text-sacred-text hover:text-sacred-gold transition-colors duration-200"
              >
                {post.author.name}
              </Link>
              <div className="flex items-center gap-2 mt-1">
                {post.community && (
                  <Link 
                    href={`/communities/${post.community.id}`}
                    className="text-sm text-sacred-muted hover:text-sacred-gold transition-colors duration-200"
                  >
                    in {post.community.name}
                  </Link>
                )}
                <span className="text-sacred-muted/60">•</span>
                <span className="text-sm text-sacred-muted">
                  {formattedTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-4">
        {/* Text content (if no media or with media as caption) */}
        {post.content && !post.media && (
          <div className="prose prose-sacred max-w-none">
            <p className="text-sacred-text leading-relaxed font-serif text-lg">
              {post.content}
            </p>
          </div>
        )}

        {/* Media */}
        {post.media && (
          <div className="rounded-2xl overflow-hidden shadow-md bg-sacred-beige/10">
            {post.media.match(/\.(mp4|webm|ogg|mov|quicktime)$/i) ? (
              <video 
                ref={videoRef}
                src={mediaUrl || ""} 
                controls 
                controlsList="nodownload nofullscreen noremoteplayback nopicture-in-picture nopanning"
                disablePictureInPicture
                className="w-full max-h-96 object-cover [&::-webkit-media-controls-fullscreen-button]:hidden"
                preload="metadata"
                playsInline
              />
            ) : (
              <img 
                src={mediaUrl || ""} 
                alt="Post media" 
                className="w-full max-h-96 object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            )}
          </div>
        )}

        {/* Caption (if media exists) */}
        {post.content && post.media && (
          <div className="mt-4 prose prose-sacred max-w-none">
            <p className="text-sacred-text leading-relaxed font-serif">
              {post.content}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-sacred-border/20 bg-white/30">
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
                  size={24} 
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
              <MessageCircle size={24} className="text-sacred-text transition-all group-hover:text-sacred-gold group-hover:scale-110" />
              {commentCount > 0 && (
                <span className="text-sm font-semibold text-sacred-text">{commentCount}</span>
              )}
            </button>

            {/* Share Button */}
            <button className="group flex items-center gap-2 outline-none">
              <Share2 size={24} className="text-sacred-text transition-all group-hover:text-sacred-gold group-hover:scale-110" />
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
                size={24} 
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
            className="border-t border-sacred-border/20 bg-white/40"
          >
            <div className="px-6 py-4 max-h-96 overflow-y-auto space-y-4">
              {/* Existing Comments */}
              {localComments && localComments.length > 0 ? (
                (() => {
                  const renderThread = (comment: any, depth = 0) => {
                    const children = localComments.filter((c: any) => c.parentId === comment.id);
                    return (
                      <div key={comment.id} className="space-y-3" style={{ marginLeft: depth ? 44 : 0 }}>
                        <div className="flex gap-3">
                          <Link href={`/profile/${comment.author.id}`} className="shrink-0">
                            <div className={`${depth ? "w-7 h-7" : "w-8 h-8"} rounded-xl bg-sacred-gold/10 flex items-center justify-center border border-sacred-gold/20 hover:border-sacred-gold/40 transition-all duration-200`}>
                              {comment.author.profile?.avatar ? (
                                <img 
                                  src={getMediaUrl(comment.author.profile.avatar) as string} 
                                  alt={comment.author.name} 
                                  className="w-full h-full object-cover rounded-xl" 
                                />
                              ) : (
                                <span className={`${depth ? "text-[10px]" : "text-xs"} font-bold text-sacred-gold`}>
                                  {comment.author.name[0]}
                                </span>
                              )}
                            </div>
                          </Link>
                          <div className="flex-1">
                            <div className={`${depth ? "bg-white/60 border border-sacred-border/30" : "bg-white/70"} rounded-2xl px-4 py-3`}>
                              <Link href={`/profile/${comment.author.id}`} className={`${depth ? "text-xs" : "text-sm"} font-semibold text-sacred-text hover:text-sacred-gold transition-colors duration-200`}>
                                {comment.author.name}
                              </Link>
                              <p className="text-sm text-sacred-text/90 mt-1 font-serif">{comment.content}</p>
                            </div>
                            <div className="flex items-center gap-4 mt-2 px-4">
                              <span className={`${depth ? "text-[11px]" : "text-xs"} text-sacred-muted`}>
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </span>
                              <button 
                                className={`${depth ? "text-[11px]" : "text-xs"} text-sacred-muted hover:text-sacred-gold font-semibold transition-colors duration-200`}
                                onClick={() => {
                                  setReplyingTo({ id: comment.id, name: comment.author.name });
                                  setCommentText(`@${comment.author.name} `);
                                  commentInputRef.current?.focus();
                                }}
                              >
                                Reply
                              </button>
                              {user?.id === comment.author.id && (
                                <button
                                  className={`${depth ? "text-[11px]" : "text-xs"} text-red-400 hover:text-red-600 font-semibold transition-colors duration-200 flex items-center gap-1`}
                                  onClick={() => deleteCommentMutation.mutate(comment.id)}
                                  disabled={deleteCommentMutation.isPending}
                                >
                                  <Trash2 size={12} /> Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        {children.map((child: any) => renderThread(child, depth + 1))}
                      </div>
                    );
                  };
                  return localComments
                    .filter((c: any) => !c.parentId)
                    .map((c: any) => renderThread(c));
                })()
              ) : (
                <p className="text-sm text-sacred-muted italic text-center py-8 font-serif">
                  No comments yet. Share your thoughts and start the conversation.
                </p>
              )}

              {/* Comment Input */}
              <form onSubmit={handleCommentSubmit} className="flex flex-col gap-3 pt-4 border-t border-white/30">
                {replyingTo && (
                  <div className="flex items-center gap-2 text-xs text-sacred-muted/80 bg-white/60 border border-sacred-border/40 rounded-xl px-3 py-2">
                    Replying to <span className="font-semibold text-sacred-text">{replyingTo.name}</span>
                    <button
                      type="button"
                      className="text-sacred-muted hover:text-sacred-gold ml-auto"
                      onClick={() => setReplyingTo(null)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sacred-gold/10 flex items-center justify-center shrink-0 border border-sacred-gold/20">
                    <span className="text-xs font-bold text-sacred-gold">Y</span>
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      ref={commentInputRef}
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your insights"
                      className="flex-1 bg-white/70 border border-white/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sacred-gold/30 focus:border-sacred-gold/50 transition-all duration-200 font-serif placeholder:italic"
                      disabled={createCommentMutation.isPending}
                    />
                    <motion.button
                      type="submit"
                      disabled={!commentText.trim() || createCommentMutation.isPending}
                      className="p-2.5 rounded-2xl bg-sacred-gold text-white hover:bg-sacred-gold-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                      whileTap={{ scale: 0.95 }}
                    >
                      {createCommentMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                    </motion.button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
