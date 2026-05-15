"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import api from "@/services/api";
import { useAuthStore } from "@/store/globalStore";
import { Loader2, Users, Flame, Sparkles, UserCircle2, MessageCircle, Tag, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { getMediaUrl } from "@/lib/media";
import type { Thread } from "@/types";

export default function CommunityHall() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"threads" | "members">("threads");
  const [sort, setSort] = useState<"recent" | "new" | "unanswered">("recent");
  const [searchTerm, setSearchTerm] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");

  const { data: community, isLoading: isLoadingCommunity } = useQuery({
    queryKey: ["community", id],
    queryFn: async () => {
      const res = await api.get(`/communities/${id}`);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });

  const { data: threadPayload, isLoading: isLoadingThreads } = useQuery({
    queryKey: ["communityThreads", id, sort],
    queryFn: async () => {
      const res = await api.get(`/communities/${id}/threads`, { params: { sort } });
      return res.data;
    },
    enabled: activeTab === "threads",
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000
  });

  const threads: Thread[] = threadPayload?.data || [];

  const filteredThreads = useMemo(() => {
    if (!searchTerm.trim()) return threads;
    const needle = searchTerm.toLowerCase();
    return threads.filter((thread) =>
      thread.title.toLowerCase().includes(needle) ||
      thread.body.toLowerCase().includes(needle) ||
      thread.tags?.some((tag) => tag.toLowerCase().includes(needle))
    );
  }, [searchTerm, threads]);

  const { data: members = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ["communityMembers", id],
    queryFn: async () => {
      const res = await api.get(`/communities/${id}/members`);
      return res.data;
    },
    enabled: activeTab === "members" && !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });

  const { data: joinedCommunities = [], refetch: refetchJoined } = useQuery({
    queryKey: ["joinedCommunities"],
    queryFn: async () => {
      const res = await api.get("/communities/joined");
      return res.data || [];
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000
  });

  const isJoined = joinedCommunities.some((c: any) => c.id === parseInt(id as string));

  const joinMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/communities/${id}/join`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["joinedCommunities"] });
      queryClient.invalidateQueries({ queryKey: ["community", id] });
      refetchJoined();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.message;
      if (msg === "Invalid token" || msg === "No token provided") {
        toast.error("Please sign in to join this circle.");
      } else {
        toast.error(msg);
      }
    }
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/communities/${id}/leave`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["joinedCommunities"] });
      queryClient.invalidateQueries({ queryKey: ["community", id] });
      refetchJoined();
    }
  });

  const createThreadMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/communities/${id}/threads`, {
        title,
        body,
        tags
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityThreads", id, sort] });
      setTitle("");
      setBody("");
      setTags("");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.message;
      if (msg === "Invalid token" || msg === "No token provided" || error.response?.status === 401) {
        toast.error("Please sign in to share a reflection.");
      } else {
        toast.error(msg);
      }
    }
  });

  const handleThreadSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !body.trim()) return;
    createThreadMutation.mutate();
  };

  const formatActivity = (value?: string) => {
    if (!value) return "Quiet";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Quiet";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  if (isLoadingCommunity) {
    return (
      <div className="flex justify-center items-center h-screen bg-sacred-beige/20">
        <Loader2 className="animate-spin text-sacred-gold" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 text-sacred-text">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,213,153,0.35),transparent_55%)] pointer-events-none" />
      <div className="absolute -top-20 right-10 w-64 h-64 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />

      <div className="relative flex h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] overflow-hidden">
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <div className="relative border-b border-white/30 px-4 py-10 md:py-14">
            <div className="max-w-4xl mx-auto space-y-4 text-center">
              <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] font-bold text-sacred-gold">
                <Flame size={14} /> Circle Forum
              </div>
              <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-sacred-text">{community?.name}</h1>
              <p className="text-sacred-muted italic text-sm md:text-base max-w-2xl mx-auto">{community?.description}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-sacred-muted">
                  <Users size={14} className="text-sacred-gold" />
                  {community?.memberCount} Seekers
                </div>
                {!isJoined ? (
                  <Button
                    onClick={() => {
                      if (!user) {
                        toast.error("Please sign in to join this circle.");
                        return;
                      }
                      joinMutation.mutate();
                    }}
                    disabled={joinMutation.isPending}
                    className="w-full sm:w-auto rounded-full px-8 bg-sacred-gold hover:bg-sacred-gold-dark text-white border-none shadow-md py-6 sm:py-2"
                  >
                    {joinMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Enter Circle"}
                  </Button>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <span className="w-full sm:w-auto text-center bg-green-100 text-green-700 px-4 py-2 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-wide uppercase border border-green-200">
                      ✓ Joined Member
                    </span>
                    <Button
                      onClick={() => leaveMutation.mutate()}
                      disabled={leaveMutation.isPending}
                      className="w-full sm:w-auto rounded-full px-6 bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 text-[10px] py-4 sm:py-2"
                    >
                      {leaveMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : "Leave"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/60 border-b border-sacred-border/30 flex justify-center px-4">
            <div className="flex gap-8 md:gap-12 min-w-max">
              {[{ key: "threads", label: "Threads" }, { key: "members", label: "Members" }].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 border-b-2 font-bold text-[10px] md:text-sm uppercase tracking-widest transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? "border-sacred-gold text-sacred-gold"
                      : "border-transparent text-sacred-muted hover:text-sacred-text"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-8">
            <div className="space-y-8">
              {activeTab === "threads" && (
                <>
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/40">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-sacred-muted">Circle Threads</p>
                        <h2 className="font-serif text-2xl md:text-3xl text-sacred-text">Seek wisdom together</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setSort("recent")}
                          className={`rounded-full px-4 py-2 text-xs font-bold ${sort === "recent" ? "bg-sacred-gold text-white" : "bg-white text-sacred-muted border border-sacred-border/40"}`}
                        >
                          Recent
                        </Button>
                        <Button
                          onClick={() => setSort("new")}
                          className={`rounded-full px-4 py-2 text-xs font-bold ${sort === "new" ? "bg-sacred-gold text-white" : "bg-white text-sacred-muted border border-sacred-border/40"}`}
                        >
                          New
                        </Button>
                        <Button
                          onClick={() => setSort("unanswered")}
                          className={`rounded-full px-4 py-2 text-xs font-bold ${sort === "unanswered" ? "bg-sacred-gold text-white" : "bg-white text-sacred-muted border border-sacred-border/40"}`}
                        >
                          Unanswered
                        </Button>
                      </div>
                    </div>
                    <div className="mt-5 flex items-center gap-3">
                      <input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search threads, tags, reflections..."
                        className="w-full bg-white/70 border border-sacred-border/30 rounded-2xl px-4 py-3 text-sm font-serif italic outline-none focus:ring-2 focus:ring-sacred-gold/20"
                      />
                    </div>
                  </div>

                  {isJoined && (
                    <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/40">
                      <form onSubmit={handleThreadSubmit} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-sacred-muted">Start a Thread</p>
                          <div className="flex items-center gap-1 text-sacred-gold">
                            <Sparkles size={13} />
                            <Sparkles size={11} className="opacity-70" />
                          </div>
                        </div>
                        <input
                          value={title}
                          onChange={(event) => setTitle(event.target.value)}
                          placeholder="What is your question or insight?"
                          className="w-full bg-white/80 border border-sacred-border/40 rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-sacred-gold/20"
                        />
                        <textarea
                          value={body}
                          onChange={(event) => setBody(event.target.value)}
                          placeholder="Share context, reflections, or the teaching you seek..."
                          className="w-full bg-white/80 border border-sacred-border/40 rounded-2xl px-4 py-3 text-sm font-serif italic outline-none focus:ring-2 focus:ring-sacred-gold/20 min-h-32"
                        />
                        <div className="flex flex-col md:flex-row gap-3">
                          <div className="flex-1 relative">
                            <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-sacred-muted" />
                            <input
                              value={tags}
                              onChange={(event) => setTags(event.target.value)}
                              placeholder="Tags: meditation, dharma, grief"
                              className="w-full bg-white/80 border border-sacred-border/40 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sacred-gold/20"
                            />
                          </div>
                          <Button
                            type="submit"
                            disabled={createThreadMutation.isPending || !title.trim() || !body.trim()}
                            className="rounded-full px-6 py-3 text-sm font-bold"
                          >
                            {createThreadMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Offer Reflection"}
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="space-y-4 pb-10">
                    {isLoadingThreads && (
                      <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-sacred-gold/50" size={32} />
                      </div>
                    )}

                    {!isLoadingThreads && filteredThreads.length === 0 && (
                      <div className="text-center py-16 bg-white/60 rounded-3xl border border-dashed border-sacred-border/50">
                        <p className="font-serif italic text-sacred-muted">No threads yet. Begin the circle with a question.</p>
                      </div>
                    )}

                    {filteredThreads.map((thread) => (
                      <Link
                        key={thread.id}
                        href={`/threads/${thread.id}`}
                        className="block bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="space-y-2">
                            <h3 className="font-serif text-xl md:text-2xl text-sacred-text leading-snug">
                              {thread.title}
                            </h3>
                            <p className="text-sm text-sacred-muted line-clamp-2">{thread.body}</p>
                            {thread.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-2">
                                {thread.tags.map((tag) => (
                                  <span key={`${thread.id}-${tag}`} className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-amber-100/70 text-amber-700">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-sacred-muted">
                            <span className="inline-flex items-center gap-1">
                              <MessageCircle size={14} /> {thread._count?.replies || 0}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock size={14} /> {formatActivity(thread.lastActivityAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 pt-4">
                          <div className="w-9 h-9 rounded-full bg-sacred-beige flex items-center justify-center text-sacred-gold font-semibold">
                            {thread.author?.name?.[0] || "S"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-sacred-text">{thread.author?.name || "Seeker"}</p>
                            <p className="text-[10px] uppercase tracking-widest text-sacred-muted">Reflection</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {activeTab === "members" && (
                <div className="space-y-4 pb-16">
                  {members.map((member: any) => (
                    <div key={member.id} className="flex flex-col md:flex-row md:items-center md:justify-between bg-white/80 rounded-2xl border border-sacred-border/30 p-4 shadow-sm gap-4">
                      <Link href={`/profile/${member.id}`} className="flex items-center gap-4 flex-1 min-w-0 group">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-sacred-beige flex items-center justify-center text-sacred-gold font-semibold shrink-0">
                          {member.profile?.avatar ? (
                            <img src={getMediaUrl(member.profile.avatar) || ""} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserCircle2 size={32} className="text-sacred-gold" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sacred-text group-hover:text-sacred-gold transition-colors">{member.name}</p>
                          <p className="text-sm text-sacred-muted line-clamp-1">{member.profile?.bio || ""}</p>
                        </div>
                      </Link>
                      <div className="flex items-center gap-3 shrink-0">
                        {user?.id !== member.id && (
                          <Link href={`/chat?userId=${member.id}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sacred-gold/40 text-sacred-gold text-sm hover:bg-sacred-gold hover:text-white transition-colors">
                            <MessageCircle size={16} /> Offer Blessing
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                  {members.length === 0 && !isLoadingMembers && (
                    <div className="text-center py-20 bg-white/60 rounded-2xl border border-dashed border-sacred-border/50 text-sacred-muted">
                      No members yet.
                    </div>
                  )}
                  {isLoadingMembers && (
                    <div className="flex justify-center py-10">
                      <Loader2 className="animate-spin text-sacred-gold/40" size={32} />
                    </div>
                  )}
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/40">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-sacred-muted">Circle Focus</p>
                <h3 className="font-serif text-xl text-sacred-text mt-2">Temple Dusk Practice</h3>
                <p className="text-sm text-sacred-muted italic mt-2">Sit with a candle, breathe 4-6, and write one honest question.</p>
              </div>
              <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/40">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-sacred-muted">Guidelines</p>
                <ul className="mt-3 space-y-2 text-sm text-sacred-muted">
                  <li>Speak from lived experience.</li>
                  <li>Offer practices, not opinions.</li>
                  <li>Honor silence and slow replies.</li>
                </ul>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
