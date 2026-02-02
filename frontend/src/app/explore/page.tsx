"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuthStore } from "@/store/globalStore";
import { Loader2, Search, Users, Compass, CheckCircle2, PlusCircle, ArrowUpRight, MessageCircle, User } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { getMediaUrl } from "@/lib/media";

interface Community {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  _count?: {
    members: number;
    posts: number;
  };
}

interface Seeker {
  id: number;
  name: string;
  role: string;
  isFollowing?: boolean;
  profile?: {
    avatar?: string;
    bio?: string;
  };
  _count: {
    followers: number;
    following: number;
    posts: number;
  };
}

export default function ExploreCommunitiesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"communities" | "seekers">("communities");

  const { data: communities = [], isLoading: loadingCommunities } = useQuery<Community[]>({
    queryKey: ["allCommunities"],
    queryFn: async () => {
      const res = await api.get("/communities");
      return res.data.data || [];
    },
  });

  const { data: seekers = [], isLoading: loadingSeekers } = useQuery<Seeker[]>({
    queryKey: ["allSeekers"],
    queryFn: async () => {
      const res = await api.get("/users");
      return res.data || [];
    },
    enabled: activeTab === "seekers",
  });

  const { data: joinedCommunities = [] } = useQuery({
    queryKey: ["joinedCommunities"],
    queryFn: async () => {
      const res = await api.get("/communities/joined");
      return res.data || [];
    },
    enabled: !!user,
  });

  const joinMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.post(`/communities/${id}/join`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["joinedCommunities"] });
      queryClient.invalidateQueries({ queryKey: ["allCommunities"] });
    },
  });

  const isJoined = (id: number) => joinedCommunities.some((c: any) => c.id === id);

  const filteredCommunities = communities.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSeekers = seekers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.profile?.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-sacred-beige/5 pt-12 pb-24 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sacred-gold">
               <div className="p-2 bg-sacred-gold/10 rounded-xl">
                 <Compass size={24} />
               </div>
               <span className="text-[10px] uppercase font-bold tracking-[0.3em]">Discovery Hub</span>
            </div>
            <h1 className="text-5xl font-serif font-bold text-sacred-text tracking-tight">Explore the Sanctuary</h1>
            <p className="text-sacred-muted italic text-lg max-w-sm">Connect with the sangha through shared circles and kindred spirits.</p>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sacred-muted/40 group-focus-within:text-sacred-gold transition-colors" size={18} />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`}
              className="w-full bg-white border border-sacred-border/30 rounded-2xl py-3.5 pl-12 pr-6 outline-none focus:ring-2 focus:ring-sacred-gold/10 transition-all font-serif italic"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-4 border-b border-sacred-gold/10 pb-1">
          <button 
            onClick={() => setActiveTab("communities")}
            className={`px-6 py-3 font-serif text-lg relative transition-colors ${activeTab === "communities" ? "text-sacred-gold font-bold" : "text-sacred-muted hover:text-sacred-gold"}`}
          >
            Communities
            {activeTab === "communities" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-sacred-gold" />}
          </button>
          <button 
            onClick={() => setActiveTab("seekers")}
            className={`px-6 py-3 font-serif text-lg relative transition-colors ${activeTab === "seekers" ? "text-sacred-gold font-bold" : "text-sacred-muted hover:text-sacred-gold"}`}
          >
            Kindred Spirits
            {activeTab === "seekers" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-sacred-gold" />}
          </button>
        </div>

        {/* Communities Grid */}
        <AnimatePresence mode="wait">
          {activeTab === "communities" ? (
            <motion.div 
              key="communities"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {loadingCommunities ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-sacred-gold" size={40} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCommunities.map((community) => {
                    const joined = isJoined(community.id);
                    return (
                      <motion.div
                        key={community.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group bg-white/60 backdrop-blur-xl rounded-4xl p-8 border border-white shadow-sm hover:shadow-xl hover:shadow-sacred-gold/5 transition-all relative overflow-hidden flex flex-col h-80"
                      >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity scale-150 pointer-events-none">
                          <Users size={120} />
                        </div>

                        <div className="space-y-6 relative flex flex-col h-full">
                          <div className="flex justify-between items-start">
                            <div className="w-16 h-16 rounded-3xl bg-sacred-beige flex items-center justify-center text-2xl font-bold text-sacred-gold group-hover:scale-110 transition-transform">
                              {community.name[0]}
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-sacred-muted/60">Seekers</span>
                              <span className="text-xl font-serif font-bold text-sacred-text">
                                {(community.memberCount || community._count?.members || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 space-y-2">
                             <h3 className="text-2xl font-serif font-bold text-sacred-text">{community.name}</h3>
                             <p className="text-sm text-sacred-muted italic line-clamp-3 leading-relaxed">
                               {community.description}
                             </p>
                          </div>

                          <div className="pt-4 flex items-center gap-3">
                            {joined ? (
                              <>
                                <Link href={`/communities/${community.id}`} className="flex-1">
                                  <Button className="w-full rounded-full bg-white border border-sacred-gold/20 text-sacred-gold hover:bg-sacred-gold/5 font-bold h-12 flex items-center gap-2">
                                    Enter Sanctuary <ArrowUpRight size={16} />
                                  </Button>
                                </Link>
                                <div className="p-3 bg-green-500/10 text-green-600 rounded-full" title="Already a member">
                                   <CheckCircle2 size={20} />
                                </div>
                              </>
                            ) : (
                              <Button 
                                onClick={() => joinMutation.mutate(community.id)}
                                disabled={joinMutation.isPending}
                                className="flex-1 rounded-full bg-sacred-gold text-white hover:bg-sacred-gold-dark font-bold h-12 shadow-md shadow-sacred-gold/20 flex items-center gap-2"
                              >
                                Join Sangha <PlusCircle size={16} />
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
              {!loadingCommunities && filteredCommunities.length === 0 && (
                <div className="text-center py-40 border border-dashed border-sacred-border/30 rounded-4xl">
                  <Compass size={48} className="mx-auto text-sacred-muted/20 mb-4" />
                  <p className="font-serif italic text-sacred-muted text-xl">The path is quiet. Try another search term.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="seekers"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {loadingSeekers ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-sacred-gold" size={40} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredSeekers.map((seeker) => (
                    <motion.div
                      key={seeker.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group bg-white/60 backdrop-blur-xl rounded-4xl p-8 border border-white shadow-sm hover:shadow-xl hover:shadow-sacred-gold/5 transition-all relative flex flex-col items-center text-center space-y-4"
                    >
                      <Link href={`/profile/${seeker.id}`} className="relative group/avatar">
                        <div className="w-24 h-24 rounded-3xl bg-sacred-gold/10 overflow-hidden border-2 border-sacred-gold/5 transition-all duration-500 group-hover:border-sacred-gold/20 group-hover:scale-105">
                          {seeker.profile?.avatar ? (
                            <img 
                              src={getMediaUrl(seeker.profile.avatar) || ""} 
                              alt={seeker.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-sacred-gold">
                              {seeker.name[0]}
                            </div>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-sacred-gold/0 group-hover/avatar:bg-sacred-gold/5 transition-colors rounded-3xl flex items-center justify-center">
                          <User className="text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                        </div>
                      </Link>

                      <div className="space-y-1">
                        <h3 className="text-2xl font-serif font-bold text-sacred-text group-hover:text-sacred-gold transition-colors">{seeker.name}</h3>
                        <p className="text-xs font-bold uppercase tracking-widest text-sacred-gold/60">{seeker.role}</p>
                      </div>

                      <p className="text-sm text-sacred-muted italic line-clamp-2 min-h-10">
                        {seeker.profile?.bio || "Awakening the light within, one breath at a time."}
                      </p>

                      <div className="flex items-center gap-6 py-2 border-y border-sacred-gold/5 w-full justify-center">
                        <div className="text-center">
                          <p className="text-xs text-sacred-muted uppercase tracking-tighter">Wisdom</p>
                          <p className="font-bold text-sacred-text">{seeker._count.posts}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-sacred-muted uppercase tracking-tighter">Followers</p>
                          <p className="font-bold text-sacred-text">{seeker._count.followers}</p>
                        </div>
                      </div>

                      <div className="flex gap-3 w-full pt-2">
                        <Link href={`/profile/${seeker.id}`} className="flex-1">
                          <Button variant="ghost" className="w-full rounded-full border border-sacred-gold/20 text-sacred-gold hover:bg-sacred-gold/5 font-bold">
                            Profile
                          </Button>
                        </Link>
                        {user?.id !== seeker.id && (
                          <Link href={`/chat?userId=${seeker.id}`} className="flex-1">
                            <Button className="w-full rounded-full bg-sacred-gold text-white hover:bg-sacred-gold/90 font-bold flex items-center justify-center gap-2">
                              <MessageCircle size={16} /> Text
                            </Button>
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              {!loadingSeekers && filteredSeekers.length === 0 && (
                <div className="text-center py-40 border border-dashed border-sacred-border/30 rounded-4xl">
                  <User size={48} className="mx-auto text-sacred-muted/20 mb-4" />
                  <p className="font-serif italic text-sacred-muted text-xl">No kindred spirits found matching your search.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
