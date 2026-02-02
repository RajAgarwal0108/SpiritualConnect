"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Loader2, ArrowLeft, Image as ImageIcon, Send, X } from "lucide-react";
import { getMediaUrl } from "@/lib/media";

export default function CreateBlogPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Reflection",
    readTime: "5 min read",
    coverImage: ""
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await api.post("/blogs", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      alert("Your wisdom has been shared with the world.");
      router.push("/blogs");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to share your wisdom.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    createMutation.mutate(formData);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const body = new FormData();
    body.append("file", file);

    try {
      const res = await api.post("/upload", body, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setFormData({ ...formData, coverImage: res.data.url });
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sacred-muted hover:text-sacred-gold transition-colors mb-8 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-serif italic text-lg">Back to Chronicles</span>
      </button>

      <div className="bg-white/70 backdrop-blur-xl p-8 md:p-12 rounded-4xl border border-sacred-gold/10 shadow-2xl shadow-sacred-gold/5">
        <div className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-sacred-text">Share Your Wisdom</h1>
          <p className="text-sacred-muted italic mt-2">Write from the heart, for the heart.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-bold text-sacred-muted uppercase tracking-[0.2em] ml-2">Cover Image (Optional)</label>
            <div className="relative group/img">
              {formData.coverImage ? (
                <div className="relative rounded-3xl overflow-hidden aspect-21/9 border-2 border-sacred-gold/20">
                  <img src={getMediaUrl(formData.coverImage) || ""} alt="Cover" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, coverImage: "" })}
                    className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-21/9 bg-sacred-beige/30 border-2 border-dashed border-sacred-gold/20 rounded-3xl cursor-pointer hover:bg-sacred-beige/50 hover:border-sacred-gold/40 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isUploading ? (
                      <Loader2 className="animate-spin text-sacred-gold mb-3" size={32} />
                    ) : (
                      <ImageIcon className="text-sacred-gold/40 mb-3 group-hover:scale-110 transition-transform" size={42} />
                    )}
                    <p className="mb-2 text-sm text-sacred-text font-serif">
                      <span className="font-bold text-sacred-gold">Click to upload</span> cover image
                    </p>
                    <p className="text-xs text-sacred-muted">PNG, JPG, or JPEG (Max 5MB)</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-sacred-muted uppercase tracking-[0.2em] ml-2">Title of Reflection</label>
            <input 
              type="text"
              placeholder="e.g. The Quiet Path Within..."
              required
              className="w-full bg-sacred-beige/30 border-none rounded-2xl px-6 py-5 text-xl font-serif text-sacred-text focus:ring-2 focus:ring-sacred-gold/20 outline-none placeholder:text-sacred-muted/40"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-sacred-muted uppercase tracking-[0.2em] ml-2">Category</label>
              <select 
                className="w-full bg-sacred-beige/30 border-none rounded-2xl px-6 py-4 font-serif text-sacred-text focus:ring-2 focus:ring-sacred-gold/20 outline-none"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option>Reflection</option>
                <option>Guide</option>
                <option>Story</option>
                <option>Meditation</option>
                <option>Poetry</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-sacred-muted uppercase tracking-[0.2em] ml-2">Read Time</label>
              <input 
                type="text"
                placeholder="e.g. 5 min read"
                className="w-full bg-sacred-beige/30 border-none rounded-2xl px-6 py-4 font-serif text-sacred-text focus:ring-2 focus:ring-sacred-gold/20 outline-none"
                value={formData.readTime}
                onChange={(e) => setFormData({...formData, readTime: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-sacred-muted uppercase tracking-[0.2em] ml-2">Short Summary</label>
            <textarea 
              placeholder="A brief essence of your reflection to entice the seekers..."
              className="w-full bg-sacred-beige/30 border-none rounded-2xl px-6 py-4 font-serif text-sacred-text focus:ring-2 focus:ring-sacred-gold/20 outline-none min-h-25 resize-none"
              value={formData.excerpt}
              onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-sacred-muted uppercase tracking-[0.2em] ml-2">Content</label>
            <textarea 
              placeholder="Let your thoughts flow like a serene river..."
              required
              className="w-full bg-sacred-beige/30 border-none rounded-2xl px-6 py-6 font-serif text-sacred-text focus:ring-2 focus:ring-sacred-gold/20 outline-none min-h-100 leading-relaxed text-lg"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
            />
          </div>

          <div className="pt-6 border-t border-sacred-gold/5 flex justify-end">
            <Button 
              type="submit" 
              disabled={createMutation.isPending || !formData.title || !formData.content}
              className="bg-sacred-gold hover:bg-sacred-gold/90 text-white rounded-2xl px-12 py-7 h-auto text-xl font-serif transition-all duration-300 hover:shadow-xl hover:shadow-sacred-gold/20 disabled:grayscale"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 size={24} className="mr-3 animate-spin" />
                  Sharing Wisdom...
                </>
              ) : (
                <>
                  <Send size={22} className="mr-3" />
                  Publish Chronicle
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
