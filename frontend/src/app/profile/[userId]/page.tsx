"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import api from "@/services/api";
import { getMediaUrl } from "@/lib/media";
import { useAuthStore } from "@/store/globalStore";
import { Loader2, Calendar, Edit, UserPlus, UserCheck, Sparkles, LogOut, Bookmark, HeartHandshake, ShieldCheck, Twitter, Instagram, Globe, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Post, UserProfile } from "@/types";
import { motion } from "framer-motion";
import { SACRED_EASE, FADE_IN_UP } from "@/lib/motion-config";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import PostCard from "@/components/PostCard";
import React, { useState } from "react";

export default function ProfilePage() {
  const { userId } = useParams();
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"posts" | "communities" | "bookmarks">("posts");
  
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      const res = await api.get(`/users/${userId}`);
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/users/${userId}/follow`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
  });

  // Calculate ownership safe for hooks
  const profileIdString = Array.isArray(userId) ? userId[0] : userId;
  const isOwnProfile = currentUser?.id.toString() === profileIdString;

  // Query for bookmarked posts (only for own profile)  
  const { data: bookmarkedPosts = [], isLoading: isLoadingBookmarks } = useQuery({
    queryKey: ["bookmarkedPosts"],
    queryFn: async () => {
      const res = await api.get("/users/me/bookmarks");
      return res.data;
    },
    enabled: !!isOwnProfile && activeTab === "bookmarks"
  });

  // Query for user's posts
  const { data: userPosts = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: ["userPosts", userId],
    queryFn: async () => {
      const res = await api.get(`/posts/user/${userId}`);
      return res.data;
    },
    enabled: activeTab === "posts"
  });

  // Ensure loading state is handled AFTER all hooks are declared
  if (isLoading) return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-sacred-gold" size={40} /></div>;
  if (!profile) return <div className="text-center py-32 font-serif italic text-sacred-muted">The seeker could not be found.</div>;

  // Verify ownership with loaded profile to be extra sure (for UI rendering)
  // const isOwnProfileVerified = currentUser?.id === profile.id; 
  // We can use the calculated isOwnProfile which matches the hooks logic.

  return (
    <main className="max-w-4xl mx-auto py-6 md:py-16 px-3 md:px-4">
      <motion.div
        initial="initial"
        animate="animate"
        variants={FADE_IN_UP}
      >
        <Card className="overflow-hidden border-none shadow-[0_20px_50px_rgba(217,160,91,0.05)] bg-white">
          {/* Header/Cover */}
          <div className="h-44 md:h-64 bg-sacred-beige flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,160,91,0.1)_0,transparent_70%)]" />
            <Sparkles className="text-sacred-gold/20 absolute top-8 right-8" size={32} />
          </div>
          
          <div className="px-4 md:px-12 pb-6 md:pb-12">
            <div className="relative flex flex-col md:flex-row md:justify-between md:items-end -mt-14 md:-mt-20 mb-6 md:mb-10 gap-4 md:gap-0">
              <div className="w-28 h-28 md:w-40 md:h-40 rounded-3xl md:rounded-4xl bg-white p-2 md:p-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden">
                {profile.profile?.avatar ? (
                  <img src={getMediaUrl(profile.profile.avatar) as string} alt={profile.name} className="w-full h-full object-cover rounded-3xl" />
                ) : (
                  <div className="w-full h-full rounded-3xl bg-sacred-beige flex items-center justify-center text-sacred-gold text-5xl font-light">
                    {profile.name[0]}
                  </div>
                )}
              </div>
              <div className="flex space-x-3 md:space-x-4 md:mb-4 w-full md:w-auto">
                {isOwnProfile ? (
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <Link href="/settings/profile" className="flex-1 md:flex-none">
                      <Button variant="secondary" className="w-full md:w-auto flex items-center space-x-2">
                        <Edit size={16} />
                        <span className="text-sm font-medium">Refine Presence</span>
                      </Button>
                    </Link>
                    <Link 
                      href={profile.guideStatus === 'APPROVED' ? "/profile/guidance" : "/guidance/apply"} 
                      className="flex-1 md:flex-none"
                    >
                      <Button variant="ghost" className="w-full md:w-auto border-sacred-gold/30 text-sacred-gold hover:bg-sacred-gold/5">
                        <HeartHandshake size={16} className="mr-2" />
                        <span className="text-sm font-medium">
                          {profile.guideStatus === 'APPROVED' ? (
                            'Guidance Dashboard'
                          ) : profile.guideStatus === 'PENDING' ? (
                            'Application Pending'
                          ) : (
                            'Become a Guide'
                          )}
                        </span>
                      </Button>
                    </Link>
                  </div>
                ) : currentUser && (
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <Button 
                      onClick={() => followMutation.mutate()}
                      variant={profile.isConnected ? "secondary" : "primary"}
                      className="min-w-35 flex-1 md:flex-none"
                    >
                      {followMutation.isPending ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : profile.isConnected ? (
                        <><UserCheck size={18} className="mr-2" /><span>Connected</span></>
                      ) : profile.isFollowing ? (
                        <><UserCheck size={18} className="mr-2" /><span>Requested</span></>
                      ) : (
                        <><UserPlus size={18} className="mr-2" /><span>Connect</span></>
                      )}
                    </Button>

                    {profile.isConnected ? (
                      <Link href={`/chat?userId=${profile.id}`} className="flex-1 md:flex-none">
                        <Button variant="secondary" className="w-full md:w-auto">
                          <MessageCircle size={18} className="mr-2" />
                          <span>Send Message</span>
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="secondary" className="w-full md:w-auto" disabled>
                        <MessageCircle size={18} className="mr-2" />
                        <span>Connect to Message</span>
                      </Button>
                    )}

                    {profile.isGuide && profile.guideStatus === 'APPROVED' && (
                      <Link href={`/guidance/${profile.id}`} className="flex-1 md:flex-none">
                        <Button variant="primary" className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700">
                          <HeartHandshake size={18} className="mr-2" />
                          <span>Request Guidance</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-4xl font-light text-sacred-text tracking-tight">{profile.name}</h1>
                {profile.isGuide && profile.guideStatus === 'APPROVED' ? (
                  <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                    <ShieldCheck size={12} className="text-indigo-600" />
                    <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest leading-none">Verified Guide</span>
                  </div>
                ) : (
                  <span className="bg-sacred-beige px-3 py-1 rounded-full text-[10px] text-sacred-gold font-bold uppercase tracking-widest mt-1">Seeks Wisdom</span>
                )}
              </div>
              
              {profile.isGuide && profile.guideStatus === 'APPROVED' && profile.guideTitle && (
                <p className="text-indigo-600 font-medium text-sm md:text-base">{profile.guideTitle}</p>
              )}
              
              {(profile.guideBio || profile.profile?.bio) && (
                <p className="text-sacred-muted text-base md:text-lg font-serif italic leading-relaxed max-w-2xl py-2 line-clamp-3">
                  "{profile.guideBio || profile.profile?.bio}"
                </p>
              )}

              {profile.profile?.interests && profile.profile.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {profile.profile.interests.map((interest) => (
                    <span key={interest} className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-amber-100/70 text-amber-700">
                      {interest}
                    </span>
                  ))}
                </div>
              )}

              {profile.profile?.socialLinks && (
                <div className="flex flex-wrap items-center gap-4 pt-3">
                  {profile.profile.socialLinks.twitter && (
                    <a href={profile.profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sacred-muted hover:text-sky-500 transition-colors text-sm">
                      <Twitter size={16} /> X
                    </a>
                  )}
                  {profile.profile.socialLinks.instagram && (
                    <a href={profile.profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sacred-muted hover:text-pink-500 transition-colors text-sm">
                      <Instagram size={16} /> Instagram
                    </a>
                  )}
                  {profile.profile.socialLinks.website && (
                    <a href={profile.profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sacred-muted hover:text-sacred-gold transition-colors text-sm">
                      <Globe size={16} /> Website
                    </a>
                  )}
                </div>
              )}
              
              <div className="flex items-center space-x-2 text-sacred-muted/60 pt-2">
                <Calendar size={16} />
                <span className="text-[11px] font-bold uppercase tracking-widest">Walking the path since {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-8 md:mt-12 pt-8 md:pt-12 border-t border-sacred-gold/10">
              <div className="flex flex-col">
                <span className="text-2xl font-light text-sacred-text">{profile._count.followers}</span>
                <span className="text-[10px] text-sacred-muted/50 font-bold uppercase tracking-widest mt-1">Seekers</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-light text-sacred-text">{profile._count.following}</span>
                <span className="text-[10px] text-sacred-muted/50 font-bold uppercase tracking-widest mt-1">Following</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-light text-sacred-gold">{profile._count.posts}</span>
                <span className="text-[10px] text-sacred-muted/50 font-bold uppercase tracking-widest mt-1">Reflections</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-light text-sacred-text">{profile._count.memberships}</span>
                <span className="text-[10px] text-sacred-muted/50 font-bold uppercase tracking-widest mt-1">Circles</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs Section */}
        <div className="mt-8 md:mt-12 space-y-5 md:space-y-8">
          <div className="space-y-3 border-b border-sacred-gold/10 pb-3 md:pb-4">
            <div className="flex gap-5 md:gap-8 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab("posts")}
                className={`text-base md:text-xl font-light font-serif italic transition-colors whitespace-nowrap ${
                  activeTab === "posts"
                    ? "text-sacred-text border-b-2 border-sacred-gold pb-2"
                    : "text-sacred-muted hover:text-sacred-text"
                }`}
              >
                Soulful Posts
              </button>
              <button
                onClick={() => setActiveTab("communities")}
                className={`text-base md:text-xl font-light font-serif italic transition-colors whitespace-nowrap ${
                  activeTab === "communities"
                    ? "text-sacred-text border-b-2 border-sacred-gold pb-2"
                    : "text-sacred-muted hover:text-sacred-text"
                }`}
              >
                Circles of Belonging
              </button>
              {isOwnProfile && (
                <button
                  onClick={() => setActiveTab("bookmarks")}
                  className={`text-base md:text-xl font-light font-serif italic transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === "bookmarks"
                      ? "text-sacred-text border-b-2 border-sacred-gold pb-2"
                      : "text-sacred-muted hover:text-sacred-text"
                  }`}
                >
                  <Bookmark size={18} />
                  Sacred Bookmarks
                </button>
              )}
            </div>
            <span className="text-[10px] text-sacred-gold font-bold uppercase tracking-widest bg-sacred-beige px-3 py-1 rounded-full">
              {activeTab === "posts" 
                ? `${userPosts.length} Posts`
                : activeTab === "communities" 
                ? `${profile._count.memberships} Communities`
                : `${bookmarkedPosts.length} Saved`
              }
            </span>
          </div>

          {/* Posts Tab */}
          {activeTab === "posts" && (
            <div className="space-y-6">
              {isLoadingPosts ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-sacred-gold" size={32} />
                </div>
              ) : userPosts.length > 0 ? (
                <div className="grid gap-4 md:gap-6">
                  {userPosts.map((post: any) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center border-2 border-dashed border-sacred-gold/10 rounded-4xl">
                  <Sparkles className="mx-auto text-sacred-gold/40 mb-4" size={48} />
                  <p className="text-sacred-muted italic font-serif text-lg">
                    {isOwnProfile ? "You haven't shared your wisdom yet..." : `${profile.name} hasn't shared any posts yet...`}
                  </p>
                  {isOwnProfile && (
                    <>
                      <p className="text-sacred-muted text-sm mt-2">
                        Join a community and start sharing your spiritual journey
                      </p>
                      <Button variant="secondary" className="mt-6" onClick={() => window.location.href = '/'}>
                        Discover Communities
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Communities Tab */}
          {activeTab === "communities" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {profile.memberships && profile.memberships.length > 0 ? (
                profile.memberships.map((membership) => (
                  <motion.a 
                    key={membership.community.id}
                    href={`/communities/${membership.community.id}`}
                    whileHover={{ y: -4 }}
                    className="group block"
                  >
                    <Card className="p-6 transition-all duration-300 hover:shadow-[0_15px_40px_rgba(217,160,91,0.08)] bg-white/50 backdrop-blur-sm border-sacred-gold/5">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 rounded-2xl bg-sacred-beige shrink-0 flex items-center justify-center text-sacred-gold text-2xl overflow-hidden">
                          {membership.community.image ? (
                            <img src={membership.community.image} alt={membership.community.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{membership.community.name[0]}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-sacred-text group-hover:text-sacred-gold transition-colors truncate">
                            {membership.community.name}
                          </h3>
                          <p className="text-sacred-muted text-sm line-clamp-2 font-serif italic mt-1 leading-relaxed">
                            {membership.community.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.a>
                ))
              ) : (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-sacred-gold/10 rounded-4xl">
                  <p className="text-sacred-muted italic font-serif">Awaiting the call of a spiritual vessel...</p>
                  {isOwnProfile && (
                    <Button variant="secondary" className="mt-4" onClick={() => window.location.href = '/'}>
                      Discover Communities
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Bookmarks Tab */}
          {activeTab === "bookmarks" && isOwnProfile && (
            <div className="space-y-6">
              {isLoadingBookmarks ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-sacred-gold" size={32} />
                </div>
              ) : bookmarkedPosts.length > 0 ? (
                <div className="grid gap-6">
                  {bookmarkedPosts.map((post: Post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center border-2 border-dashed border-sacred-gold/10 rounded-4xl">
                  <Bookmark className="mx-auto text-sacred-gold/40 mb-4" size={48} />
                  <p className="text-sacred-muted italic font-serif text-lg">No sacred texts saved yet...</p>
                  <p className="text-sacred-muted text-sm mt-2">
                    Bookmark inspiring posts to revisit them later
                  </p>
                  <Button variant="secondary" className="mt-6" onClick={() => window.location.href = '/'}>
                    Explore Feed
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
