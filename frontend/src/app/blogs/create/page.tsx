"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api, { uploadApi } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Loader2, ArrowLeft, Image as ImageIcon, Send, X, Camera, Sparkles } from "lucide-react";
import { getMediaUrl } from "@/lib/media";
import { motion } from "framer-motion";

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const body = new FormData();
    body.append("file", file);

    try {
      const res = await uploadApi.post("/upload", body);
      setFormData({ ...formData, coverImage: res.data.url });
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || createMutation.isPending) return;
    createMutation.mutate(formData);
  };

  return (
    <div className="relative min-h-screen bg-[#FDFCFB] pb-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(217,185,127,0.12),transparent_38%)]" />
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-100">
        <div className="max-w-4xl mx-auto px-3 md:px-4 h-14 md:h-16 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="size-5" />
          </button>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Share Wisdom</span>
          <div className="w-9" />
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto px-2 md:px-4 pt-4 md:pt-6 text-stone-900">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 rounded-[1.75rem] border border-stone-200 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 md:p-8 space-y-6"
        >
          <div className="space-y-1 pb-2 border-b border-stone-100">
            <h1 className="text-2xl md:text-3xl font-serif text-stone-900">Share Wisdom</h1>
            <p className="text-sm italic text-stone-500">Write from the heart, for the heart.</p>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Title</label>
            <textarea
              placeholder="The Silent Path..."
              className="w-full text-2xl md:text-4xl font-serif bg-transparent border-none focus:ring-0 placeholder:text-stone-200 resize-none min-h-20 leading-tight"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Cover Image (Optional)</label>
            <div
              className="relative aspect-video md:aspect-21/9 rounded-2xl bg-linear-to-b from-stone-50 to-amber-50/40 border border-stone-200 overflow-hidden group cursor-pointer"
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              {formData.coverImage ? (
                <>
                  <Image
                    src={getMediaUrl(formData.coverImage) || ""}
                    alt="Preview"
                    width={800}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="size-8 text-white" />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({ ...formData, coverImage: "" });
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/45 text-white hover:bg-red-500 transition-colors"
                    aria-label="Remove cover image"
                  >
                    <X className="size-4" />
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-300 gap-2">
                  {isUploading ? (
                    <Loader2 className="size-8 animate-spin" />
                  ) : (
                    <>
                      <ImageIcon className="size-8" />
                      <span className="text-sm font-medium">Add Cover Image</span>
                      <span className="text-xs text-stone-400">PNG, JPG, or JPEG (Max 5MB)</span>
                    </>
                  )}
                </div>
              )}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Category</label>
              <select
                className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-1 focus:ring-stone-900 transition-all outline-none"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option>Reflection</option>
                <option>Ancient Wisdom</option>
                <option>Mindfulness</option>
                <option>Ritual</option>
                <option>Guide</option>
                <option>Story</option>
                <option>Meditation</option>
                <option>Poetry</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Read Time</label>
              <input
                type="text"
                placeholder="e.g. 5 min read"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-1 focus:ring-stone-900 transition-all outline-none"
                value={formData.readTime}
                onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Short Summary</label>
            <textarea
              placeholder="A short summary to entice seekers..."
              className="w-full p-4 md:p-5 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-1 focus:ring-stone-900 transition-all outline-none resize-none h-28 md:h-32"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Content</label>
            <textarea
              placeholder="Share your spiritual journey here..."
              className="w-full text-base md:text-lg font-serif bg-stone-50 border border-stone-100 rounded-2xl focus:ring-1 focus:ring-stone-900 placeholder:text-stone-300 resize-none min-h-72 md:min-h-87.5 p-4 md:p-6 leading-[1.8] text-stone-700 outline-none"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div className="pt-5 border-t border-stone-100">
            <Button
              type="submit"
              disabled={createMutation.isPending || !formData.title || !formData.content}
              className="w-full py-4 md:py-5 h-auto bg-stone-900 text-white rounded-full font-bold text-base md:text-lg hover:bg-stone-800 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="size-6 animate-spin" />
                  Sharing Wisdom...
                </>
              ) : (
                <>
                  <Send className="size-5" />
                  Publish Chronicle
                  <Sparkles className="size-5" />
                </>
              )}
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
