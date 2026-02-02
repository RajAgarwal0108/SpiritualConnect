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
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();

  const handleGoogleLogin = () => {
    const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_placeholder",
      redirect_uri: "http://localhost:3000/google-callback",
      response_type: "code",
      scope: "email profile",
      access_type: "offline"
    });
    
    window.location.href = `${GOOGLE_AUTH_URL}?${params.toString()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Credentials do not resonate.");
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
              className="w-16 h-16 bg-sacred-beige rounded-3xl flex items-center justify-center mx-auto mb-6 text-sacred-gold shadow-sm"
            >
              <Sparkles size={32} />
            </motion.div>
            <h2 className="text-3xl font-light text-sacred-text mb-2 tracking-tight">Enter the Circle</h2>
            <p className="text-sacred-muted font-serif italic text-sm">Welcome back to your spiritual sanctuary.</p>
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
              <label className="text-[10px] font-bold text-sacred-muted/50 uppercase tracking-[0.2em] ml-1">Vedic Identity (Email)</label>
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
              <label className="text-[10px] font-bold text-sacred-muted/50 uppercase tracking-[0.2em] ml-1">Sacred Phrase (Password)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-sacred-beige/20 border border-sacred-gold/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-sacred-gold/20 transition-all placeholder:text-sacred-muted/30"
                placeholder="••••••••"
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin mx-auto" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Begin Journey <ArrowRight size={18} />
                </span>
              )}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-sacred-gold/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-white px-2 text-sacred-muted/50 font-bold">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-4 bg-white border border-sacred-gold/20 rounded-2xl flex items-center justify-center gap-3 text-sacred-text text-sm font-bold hover:bg-sacred-beige/20 transition-all group cursor-pointer"
          >
             <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            <span className="group-hover:text-sacred-gold transition-colors">Google</span>
          </button>

          <p className="mt-10 text-center text-[11px] font-medium text-sacred-muted/50 uppercase tracking-widest">
            New seeker?{" "}
            <Link href="/register" className="text-sacred-gold hover:text-sacred-text transition-colors decoration-sacred-gold/20 underline underline-offset-4">
              Join the lineage
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
