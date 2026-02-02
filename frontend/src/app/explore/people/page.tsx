"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuthStore } from "@/store/globalStore";
import { useUIStore } from "@/store/uiStore";
import { Loader2, UserPlus, UserCheck, MessageCircle, MapPin, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface Seeker {
  id: number;
  name: string;
  email: string;
  profile?: {
    bio?: string;
    avatar?: string;
    interests?: string[];
  };
  communities?: { community: { name: string } }[];
  followers?: { followerId: number }[];
}

export default function ExplorePeople() {
  const { user } = useAuthStore();
  const { openChatWith } = useUIStore();
  const queryClient = useQueryClient();

  const { data: seekers = [], isLoading } = useQuery({
    queryKey: ["seekers"],
    queryFn: async () => {
      const res = await api.get("/users");
      // Filter out self
      return (res.data || []).filter((s: Seeker) => s.id !== user?.id);
    }
  });

  const followMutation = useMutation({
    mutationFn: async (targetId: number) => {
      const res = await api.post(`/users/${targetId}/follow`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seekers"] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-sacred-beige/20">
        <Loader2 className="animate-spin text-sacred-gold" size={40} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden relative bg-sacred-beige/10 text-sacred-text">

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar py-12 px-8">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-3">
                    <h1 className="font-serif text-4xl font-bold tracking-tight text-sacred-text">Seekers of Resonance</h1>
                    <p className="text-sacred-muted italic">Connect with like-minded souls on the same spiritual path.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                    {seekers.map((seeker: Seeker) => {
                        const isFollowing = seeker.followers?.some(f => f.followerId === user?.id);
                        
                        return (
                            <div key={seeker.id} className="bg-white/60 backdrop-blur-xl rounded-4xl p-6 border border-white/40 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center space-y-4">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full bg-sacred-gold/10 border-2 border-sacred-gold/20 flex items-center justify-center text-3xl font-serif font-bold text-sacred-gold overflow-hidden">
                                        {seeker.profile?.avatar ? (
                                            <img src={seeker.profile.avatar} alt={seeker.name} className="w-full h-full object-cover" />
                                        ) : (
                                            seeker.name[0]
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                                        <Sparkles size={14} className="text-sacred-gold" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="font-serif text-xl font-bold text-sacred-text">{seeker.name}</h3>
                                    <div className="flex items-center justify-center gap-1.5 text-sacred-muted/70 text-[10px] uppercase font-bold tracking-widest">
                                        <MapPin size={10} />
                                        <span>Cosmic Seeker</span>
                                    </div>
                                </div>

                                <p className="text-sacred-muted text-sm italic line-clamp-2 min-h-10">
                                    {seeker.profile?.bio || "Exploring the depths of consciousness in silence..."}
                                </p>

                                <div className="w-full pt-4 space-y-3">
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {seeker.profile?.interests?.slice(0, 3).map(interest => (
                                            <span key={interest} className="px-3 py-1 bg-sacred-beige/50 text-sacred-gold text-[10px] font-bold uppercase tracking-wider rounded-full border border-sacred-gold/10">
                                                {interest}
                                            </span>
                                        ))}
                                    </div>
                                    
                                    <div className="flex gap-2 pt-2">
                                        <Link href={`/profile/${seeker.id}`} className="flex-1">
                                            <Button 
                                                className="w-full rounded-full text-xs font-bold tracking-wide uppercase py-3"
                                                variant="primary"
                                            >
                                                <span className="flex items-center gap-2 justify-center"><User size={16}/> View Profile</span>
                                            </Button>
                                        </Link>
                                        <Button 
                                            variant="ghost" 
                                            className="rounded-full w-12 h-12 p-0 flex items-center justify-center text-sacred-muted hover:text-sacred-gold bg-white/40 border border-white/20"
                                            onClick={() => openChatWith({
                                                id: seeker.id,
                                                name: seeker.name,
                                                avatar: seeker.profile?.avatar
                                            })}
                                        >
                                            <MessageCircle size={20} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    </div>
  );
}
