"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuthStore } from "@/store/globalStore";
import { Button } from "@/components/ui/Button";
import { Loader2, MessageCircle, Tag, CornerDownRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Thread, ThreadReply } from "@/types";
import toast from "react-hot-toast";

const replyTypes = ["GENERAL", "BLESSING", "PRACTICE", "TEXT"] as const;

type ReplyNode = ThreadReply & { children: ReplyNode[] };

const buildReplyTree = (replies: ThreadReply[]): ReplyNode[] => {
  const nodeMap = new Map<number, ReplyNode>();
  replies.forEach((reply) => {
    nodeMap.set(reply.id, { ...reply, children: [] });
  });

  const roots: ReplyNode[] = [];
  nodeMap.forEach((node) => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export default function ThreadDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [replyBody, setReplyBody] = useState("");
  const [replyType, setReplyType] = useState<(typeof replyTypes)[number]>("GENERAL");
  const [parentId, setParentId] = useState<number | null>(null);

  const { data: thread, isLoading: isLoadingThread } = useQuery<Thread>({
    queryKey: ["thread", id],
    queryFn: async () => {
      const res = await api.get(`/threads/${id}`);
      return res.data;
    }
  });

  const { data: replies = [], isLoading: isLoadingReplies } = useQuery<ThreadReply[]>({
    queryKey: ["threadReplies", id],
    queryFn: async () => {
      const res = await api.get(`/threads/${id}/replies`);
      return res.data;
    }
  });

  const replyTree = useMemo(() => buildReplyTree(replies), [replies]);

  const replyMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/threads/${id}/replies`, {
        body: replyBody,
        replyType,
        parentId
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threadReplies", id] });
      queryClient.invalidateQueries({ queryKey: ["thread", id] });
      setReplyBody("");
      setReplyType("GENERAL");
      setParentId(null);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.message;
      if (msg === "Invalid token" || msg === "No token provided" || error.response?.status === 401) {
        toast.error("Please sign in to share a reply.");
      } else {
        toast.error(msg);
      }
    }
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!replyBody.trim()) return;
    replyMutation.mutate();
  };

  const renderReplies = (nodes: ReplyNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.id} className="space-y-3">
        <div className={`rounded-2xl border border-white/40 bg-white/80 p-4 shadow-sm ${depth > 0 ? "ml-4 md:ml-8" : ""}`}>
          <div className="flex items-center justify-between text-xs text-sacred-muted">
            <span className="font-semibold text-sacred-text">{node.author?.name || "Seeker"}</span>
            <span>{formatDate(node.createdAt)}</span>
          </div>
          <p className="mt-2 text-sm text-sacred-text leading-relaxed">{node.body}</p>
          <div className="mt-3 flex items-center gap-3 text-[10px] uppercase tracking-widest text-sacred-muted">
            <span className="inline-flex items-center gap-1"><MessageCircle size={12} /> {node.replyType.toLowerCase()}</span>
            {user && (
              <button
                type="button"
                onClick={() => setParentId(node.id)}
                className="inline-flex items-center gap-1 text-sacred-gold hover:underline"
              >
                <CornerDownRight size={12} /> Reply
              </button>
            )}
          </div>
        </div>
        {node.children.length > 0 && (
          <div className="space-y-3">{renderReplies(node.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  if (isLoadingThread) {
    return (
      <div className="flex justify-center items-center h-screen bg-sacred-beige/20">
        <Loader2 className="animate-spin text-sacred-gold" size={40} />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex justify-center items-center h-screen bg-sacred-beige/20">
        <p className="text-sacred-muted">Thread not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 text-sacred-text">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8">
        <Link href={`/communities/${thread.communityId}`} className="inline-flex items-center gap-2 text-sacred-gold text-sm font-semibold hover:underline">
          <ArrowLeft size={16} /> Back to Circle
        </Link>

        <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/40 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-xs text-sacred-muted">
            <span className="font-semibold text-sacred-text">{thread.author?.name || "Seeker"}</span>
            <span>{formatDate(thread.createdAt)}</span>
          </div>
          <h1 className="font-serif text-2xl md:text-4xl text-sacred-text">{thread.title}</h1>
          <p className="text-sm md:text-base text-sacred-text leading-relaxed">{thread.body}</p>
          {thread.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {thread.tags.map((tag) => (
                <span key={`${thread.id}-${tag}`} className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-amber-100/70 text-amber-700 inline-flex items-center gap-1">
                  <Tag size={10} /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 border border-white/40 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-sacred-muted">Offer a Reply</p>
            {parentId && (
              <button
                type="button"
                onClick={() => setParentId(null)}
                className="text-xs text-sacred-gold hover:underline"
              >
                Replying to a seeker. Clear
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={replyBody}
              onChange={(event) => setReplyBody(event.target.value)}
              placeholder="Share a blessing, practice, or a helpful text..."
              className="w-full min-h-28 bg-white/80 border border-sacred-border/40 rounded-2xl px-4 py-3 text-sm font-serif italic outline-none focus:ring-2 focus:ring-sacred-gold/20"
            />
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
              <select
                value={replyType}
                onChange={(event) => setReplyType(event.target.value as typeof replyType)}
                className="rounded-full border border-sacred-border/40 bg-white/80 px-4 py-2 text-xs font-bold text-sacred-muted"
              >
                {replyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.toLowerCase()}
                  </option>
                ))}
              </select>
              <Button
                type="submit"
                disabled={replyMutation.isPending || !replyBody.trim() || !user}
                className="rounded-full px-6 py-2 text-sm font-bold"
              >
                {replyMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Send Reply"}
              </Button>
            </div>
            {!user && (
              <p className="text-xs text-sacred-muted">Sign in to reply to this circle.</p>
            )}
          </form>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] font-bold text-sacred-muted">
            <MessageCircle size={14} /> Replies
          </div>
          {isLoadingReplies && (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin text-sacred-gold/50" size={32} />
            </div>
          )}
          {!isLoadingReplies && replies.length === 0 && (
            <div className="text-center py-12 bg-white/60 rounded-2xl border border-dashed border-sacred-border/50">
              <p className="text-sacred-muted italic">No replies yet. Offer the first blessing.</p>
            </div>
          )}
          <div className="space-y-4">
            {renderReplies(replyTree)}
          </div>
        </div>
      </div>
    </div>
  );
}
