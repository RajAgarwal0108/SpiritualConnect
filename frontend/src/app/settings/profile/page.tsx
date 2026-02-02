"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/globalStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { Loader2, Camera, Check, Twitter, Instagram, Globe, Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

const avatars = [
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Buddy",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Coby",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Milo",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Leo",
];

export default function ProfileSettingsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: "", // Profile bio
    socialLinks: { twitter: "", instagram: "", website: "" },
    interests: [] as string[],
    avatar: "",
  });
  const [interestInput, setInterestInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load existing profile to prefill form
  useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        const res = await api.get(`/users/${user.id}`);
        const profile = res.data;
        setFormData((prev) => ({
          ...prev,
          name: profile.name || prev.name,
          bio: profile.profile?.bio || prev.bio,
          avatar: profile.profile?.avatar || prev.avatar,
          socialLinks: profile.profile?.socialLinks || prev.socialLinks,
          interests: profile.profile?.interests || prev.interests,
        }));
      } catch (err) {
        // ignore
      }
    })();
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.put(`/users/${user?.id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", user?.id] });
      alert("Profile updated successfully!");
    },
  });

  const handleAvatarSelect = (url: string) => {
    setFormData(prev => ({ ...prev, avatar: url }));
  };

  const addInterest = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && interestInput.trim()) {
      e.preventDefault();
      if (!formData.interests.includes(interestInput.trim())) {
        setFormData(prev => ({ 
          ...prev, 
          interests: [...prev.interests, interestInput.trim()] 
        }));
      }
      setInterestInput("");
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  return (
    <div className="space-y-12 pb-20">
      <div>
        <h3 className="text-3xl font-light text-sacred-text mb-2 tracking-tight">Public Identity</h3>
        <p className="text-sacred-muted font-medium font-serif italic">How the spiritual community sees your essence.</p>
      </div>

      <section className="space-y-6">
        <label className="text-[10px] font-bold text-sacred-muted/60 uppercase tracking-widest block">Select your Avatar</label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {avatars.map((url) => (
            <button
              key={url}
              onClick={() => handleAvatarSelect(url)}
              className={`relative aspect-square rounded-3xl overflow-hidden border-2 transition-all duration-300 shadow-sm ${
                formData.avatar === url ? "border-sacred-gold scale-105 shadow-md" : "border-transparent hover:border-sacred-gold/30 hover:shadow-md"
              }`}
            >
              <img src={url} alt="Avatar" className="w-full h-full object-cover" />
              {formData.avatar === url && (
                <div className="absolute inset-0 bg-sacred-gold/20 flex items-center justify-center">
                  <Check className="text-white drop-shadow-md" size={32} strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-3xl border-2 border-dashed border-sacred-gold/30 flex flex-col items-center justify-center text-sacred-muted/60 hover:border-sacred-gold hover:text-sacred-gold transition-all cursor-pointer bg-white group hover:bg-sacred-gold/5"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const fd = new FormData();
                fd.append("file", file);
                try {
                  const res = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
                  const url = res.data.url;
                  setFormData((prev) => ({ ...prev, avatar: url }));
                } catch (err) {
                  alert("Upload failed");
                }
              }}
            />
            <Camera size={24} className="group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-bold mt-2 tracking-widest">UPLOAD</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-sacred-muted/60 uppercase tracking-widest ml-1">Display Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white border border-sacred-gold/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-sacred-gold/20 focus:border-sacred-gold/30 text-sacred-text font-medium transition-all shadow-xs"
              placeholder="Your name"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-sacred-muted/60 uppercase tracking-widest ml-1">Soulful Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-white border border-sacred-gold/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-sacred-gold/20 focus:border-sacred-gold/30 text-sacred-text font-serif italic text-lg leading-relaxed h-40 resize-none transition-all shadow-xs placeholder:text-sacred-muted/30"
              placeholder="Share what drives your spirit..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-sacred-muted/60 uppercase tracking-widest ml-1">
              Spiritual Interests <span className="font-normal normal-case text-sacred-muted/40">(Press Enter to add)</span>
            </label>
            <div className="w-full bg-white border border-sacred-gold/10 rounded-2xl p-4 shadow-xs min-h-20 flex flex-wrap gap-2 transition-all focus-within:ring-2 focus-within:ring-sacred-gold/20 focus-within:border-sacred-gold/30">
              {formData.interests.map((interest) => (
                <span key={interest} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sacred-beige text-sacred-gold text-xs font-bold uppercase tracking-wide border border-sacred-gold/10 animate-in fade-in zoom-in duration-200">
                  {interest}
                  <button onClick={() => removeInterest(interest)} className="hover:text-red-500 transition-colors">
                    <X size={14} />
                  </button>
                </span>
              ))}
              <input 
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={addInterest}
                className="bg-transparent border-none focus:ring-0 text-sm flex-1 min-w-30 placeholder:text-sacred-muted/30 outline-none"
                placeholder="Yoga, Meditation, Vedas..."
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <label className="text-[10px] font-bold text-sacred-muted/60 uppercase tracking-widest block mb-4">Social Connections</label>
          <div className="space-y-4">
            <div className="group flex items-center space-x-3 bg-white border border-sacred-gold/10 rounded-2xl px-6 py-4 transition-all focus-within:ring-2 focus-within:ring-sacred-gold/20 focus-within:border-sacred-gold/30 shadow-xs">
              <Twitter className="text-sacred-muted group-focus-within:text-sky-500 transition-colors" size={20} />
              <input 
                placeholder="Twitter profile URL"
                className="bg-transparent border-none focus:ring-0 focus:outline-none flex-1 font-medium text-sacred-text placeholder:text-sacred-muted/30"
                value={formData.socialLinks?.twitter || ""}
                onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, twitter: e.target.value}})}
              />
            </div>
            <div className="group flex items-center space-x-3 bg-white border border-sacred-gold/10 rounded-2xl px-6 py-4 transition-all focus-within:ring-2 focus-within:ring-sacred-gold/20 focus-within:border-sacred-gold/30 shadow-xs">
              <Instagram className="text-sacred-muted group-focus-within:text-pink-500 transition-colors" size={20} />
              <input 
                placeholder="Instagram profile URL"
                className="bg-transparent border-none focus:ring-0 focus:outline-none flex-1 font-medium text-sacred-text placeholder:text-sacred-muted/30"
                value={formData.socialLinks?.instagram || ""}
                onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, instagram: e.target.value}})}
              />
            </div>
            <div className="group flex items-center space-x-3 bg-white border border-sacred-gold/10 rounded-2xl px-6 py-4 transition-all focus-within:ring-2 focus-within:ring-sacred-gold/20 focus-within:border-sacred-gold/30 shadow-xs">
              <Globe className="text-sacred-muted group-focus-within:text-sacred-gold transition-colors" size={20} />
              <input 
                placeholder="Personal website URL"
                className="bg-transparent border-none focus:ring-0 focus:outline-none flex-1 font-medium text-sacred-text placeholder:text-sacred-muted/30"
                value={formData.socialLinks?.website || ""}
                onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, website: e.target.value}})}
              />
            </div>
          </div>
        </div>
      </div>

        <div className="pt-8 flex justify-end">
        <Button
          onClick={() => updateProfileMutation.mutate({
            name: formData.name,
            bio: formData.bio,
            avatar: formData.avatar,
            socialLinks: formData.socialLinks,
            interests: formData.interests,
            avatarType: formData.avatar ? 'custom' : undefined,
          })}
          disabled={updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending && <Loader2 className="animate-spin mr-2" size={18} />}
          Sync Changes
        </Button>
      </div>
    </div>
  );
}
