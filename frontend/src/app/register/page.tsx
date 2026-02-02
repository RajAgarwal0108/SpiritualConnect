"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useAuthStore } from "@/store/globalStore";
import Link from "next/link";
import { motion } from "framer-motion";
import { SACRED_EASE, FADE_IN_UP } from "@/lib/motion-config";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sparkles, ArrowRight, Loader2, User } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/register", { email, password, name });
      setToken(res.data.token);
      setUser(res.data.user);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Communication error with the temple.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <motion.div
        initial="initial"
        animate="animate"
        variants={FADE_IN_UP}
        className="max-w-md w-full"
      >
        <Card className="p-10 md:p-12 border-none shadow-[0_30px_70px_rgba(217,160,91,0.1)] bg-white">
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: SACRED_EASE as any }}
              className="w-16 h-16 bg-sacred-gold text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_10px_25px_rgba(217,160,91,0.3)]"
            >
              <User size={32} />
            </motion.div>
            <h2 className="text-3xl font-light text-[#5C5445] mb-2 tracking-tight">Initiate Your Journey</h2>
            <p className="text-sacred-muted font-serif italic text-sm">Join a lineage of seekers from across the world.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 text-red-500 text-[11px] font-bold uppercase tracking-widest p-4 rounded-2xl mb-8 text-center border border-red-100"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-sacred-muted/50 uppercase tracking-widest ml-1">Spiritual Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-sacred-beige/20 border border-sacred-gold/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-sacred-gold/20 transition-all placeholder:text-sacred-muted/30"
                placeholder="What shall we call you?"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-sacred-muted/50 uppercase tracking-widest ml-1">Vedic Identity (Email)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-sacred-beige/20 border border-sacred-gold/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-sacred-gold/20 transition-all placeholder:text-sacred-muted/30"
                placeholder="your@soul.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-sacred-muted/50 uppercase tracking-widest ml-1">Sacred Phrase (Password)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-sacred-beige/20 border border-sacred-gold/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-sacred-gold/20 transition-all placeholder:text-sacred-muted/30"
                placeholder="Secure your presence"
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-6 shadow-lg"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin mx-auto" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Presence <Sparkles size={18} />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-10 text-center text-[11px] font-medium text-sacred-muted/50 uppercase tracking-widest">
            Already a member?{" "}
            <Link href="/login" className="text-sacred-gold hover:text-[#5C5445] transition-colors decoration-sacred-gold/20 underline underline-offset-4">
              Return to the Temple
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
