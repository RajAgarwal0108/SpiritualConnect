"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, ExternalLink, BookOpen, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import api from "@/services/api";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AIResponse {
  spiritualTexts: Array<{
    source: string;
    title: string;
    content: string;
    tags: string[];
  }>;
  websiteContent: {
    posts: Array<{
      type: string;
      title: string;
      author: string;
      community?: string;
      link: string;
      content: string;
    }>;
    profiles: Array<{
      type: string;
      title: string;
      bio?: string;
      link: string;
    }>;
  };
  answer: string;
}

export default function AIAssistantPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [history, setHistory] = useState<Array<{ q: string; r: AIResponse }>>([]);
  const [error, setError] = useState("");

  const handleQuery = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setError("");
    setResponse({
      spiritualTexts: [],
      websiteContent: { posts: [], profiles: [] },
      answer: ""
    });

    try {
      console.log("Sending query:", question);
      
      const res = await api.post("/ai/query", { question });
      const data = res.data;

      setResponse({
        spiritualTexts: data.spiritualTexts || [],
        websiteContent: data.websiteContent || { posts: [], profiles: [] },
        answer: data.answer || "",
      });

      setHistory(prev => [...prev, {
        q: question,
        r: {
          spiritualTexts: data.spiritualTexts || [],
          websiteContent: data.websiteContent || { posts: [], profiles: [] },
          answer: data.answer || "",
        }
      }]);

      setQuestion("");
    } catch (error: any) {
      console.error("AI Query failed:", error);
      setError(error.message || "Failed to query the Oracle");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 md:py-12 px-2 md:px-4 space-y-6 md:space-y-8">
      <div className="text-center space-y-3 md:space-y-4">
        <div className="relative inline-block">
          <Sparkles className="mx-auto text-sacred-gold animate-pulse w-10 h-10 md:w-12 md:h-12" />
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -inset-4 bg-sacred-gold/5 blur-2xl rounded-full -z-10"
          />
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-sacred-text tracking-tight">Vedic Oracle</h1>
        <p className="text-sacred-muted italic text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          Ask the ancient wisdom combined with insights from your spiritual community. 
          The Oracle searches sacred texts and your website for authentic guidance.
        </p>
      </div>

      <Card className="p-3.5 md:p-8 space-y-6 bg-white/50 backdrop-blur-xl border-sacred-gold/10 rounded-3xl shadow-sm">
        {/* Input Section */}
        <div className="space-y-3 md:space-y-4">
          <label className="block text-xs md:text-sm font-bold uppercase tracking-widest text-sacred-muted opacity-60">Your Question</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleQuery()}
                placeholder="What weighs on your soul?"
                className="w-full bg-white border border-sacred-gold/10 rounded-2xl px-5 md:px-6 py-3 md:py-3.5 text-sacred-text placeholder:text-sacred-muted/30 focus:outline-none focus:ring-2 focus:ring-sacred-gold/20 transition-all font-serif italic"
              />
            </div>
            <Button
              onClick={handleQuery}
              disabled={loading}
              className="flex items-center justify-center gap-2 h-12 md:h-auto rounded-2xl bg-sacred-gold hover:bg-sacred-text text-white shadow-lg shadow-sacred-gold/20 transition-all duration-300"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <span className="sm:hidden font-bold uppercase tracking-widest text-xs">Consult Oracle</span>
                  <Send size={18} />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Response Section */}
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pt-6 border-t border-sacred-gold/10"
          >
            {/* Main Answer */}
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="h-px w-8 bg-sacred-gold/20" />
                <Sparkles size={16} className="text-sacred-gold opacity-50" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-sacred-muted"></h3>
                <Sparkles size={16} className="text-sacred-gold opacity-50" />
                <div className="h-px w-8 bg-sacred-gold/20" />
              </div>
              <div className="px-2 md:px-12 text-sacred-text leading-relaxed font-serif text-lg md:text-xl selection:bg-sacred-gold/10 text-left [&>p]:mb-4 [&>p]:italic [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ul>li]:mb-1 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h1]:mt-6 [&>h1]:text-sacred-gold [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-3 [&>h2]:mt-6 [&>h2]:text-sacred-gold [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mb-3 [&>h3]:mt-4 [&>strong]:text-sacred-gold [&>strong]:font-bold [&>strong]:not-italic">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {response.answer}
                </ReactMarkdown>
              </div>
              <div className="flex justify-center pt-2">
                <div className="w-12 h-0.5 bg-sacred-gold/10 rounded-full" />
              </div>
            </div>

            {/* Results Grid Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 md:pt-16 px-2 md:px-6">
              {/* Spiritual Texts Results */}
              {response.spiritualTexts.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-sacred-gold/5 pb-3">
                    <BookOpen size={14} className="text-sacred-gold/40" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-sacred-muted/60">Sacred Fragments</h3>
                  </div>
                  <div className="space-y-6">
                    {response.spiritualTexts.map((text, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-1 hover:opacity-80 transition-opacity"
                      >
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <h4 className="font-serif text-lg font-bold text-sacred-text">{text.title}</h4>
                            <p className="text-[9px] text-sacred-gold/60 font-bold uppercase tracking-[0.2em]">{text.source}</p>
                          </div>
                          <p className="text-sm text-sacred-muted leading-relaxed italic border-l-2 border-sacred-gold/10 pl-4">{text.content}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Website Content Results */}
              {(response.websiteContent.posts.length > 0 || response.websiteContent.profiles.length > 0) && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-sacred-gold/5 pb-3">
                    <Users size={14} className="text-sacred-gold/40" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-sacred-muted/60">Community Echoes</h3>
                  </div>
                  <div className="space-y-6">
                    {[...response.websiteContent.posts.slice(0, 2), ...response.websiteContent.profiles.slice(0, 1)].map((item: any, idx) => (
                      <motion.div
                        key={idx}
                        className="hover:opacity-80 transition-opacity"
                      >
                        <Link href={item.link} className="block space-y-3">
                           <div className="flex justify-between items-start border-l-2 border-sacred-gold/10 pl-4">
                             <div className="space-y-1">
                               <h4 className="font-serif text-lg font-bold text-sacred-text leading-tight">{item.title}</h4>
                               <p className="text-xs text-sacred-muted line-clamp-2">
                                 {item.content || item.bio || "Connecting through spiritual resonance..."}
                               </p>
                             </div>
                             <ExternalLink size={12} className="text-sacred-gold/30 mt-1" />
                           </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!response && !loading && (
          <div className="text-center py-10 md:py-16 text-sacred-muted italic font-serif space-y-4">
            <div className="w-16 h-16 bg-sacred-gold/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-sacred-gold/10">
               <Sparkles size={24} className="text-sacred-gold opacity-40" />
            </div>
            <p className="text-base md:text-lg max-w-md mx-auto leading-relaxed px-4">Seek and you shall find. The Oracle awaits your inquiry into the sacred mysteries.</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 md:py-24 space-y-6">
            <div className="relative">
              <Loader2 size={48} className="animate-spin text-sacred-gold" />
              <div className="absolute inset-0 bg-sacred-gold/20 blur-xl rounded-full scale-150 animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sacred-text font-serif text-xl md:text-2xl italic">The Oracle is meditating...</p>
              <p className="text-sacred-muted text-xs md:text-sm uppercase tracking-[0.2em] font-bold">Consulting ancient scripts</p>
            </div>
          </div>
        )}
      </Card>

      {/* Suggestions */}
      {!response && !loading && (
        <div className="space-y-6 pt-4">
          <h3 className="text-[10px] md:text-xs font-bold text-sacred-muted uppercase tracking-[0.3em] text-center">Suggested Inquiries</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "What is karma?",
              "Meaning of Dharma",
              "Path to Inner Peace",
              "Ancient Wisdom",
              "Soul Resonance"
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setQuestion(suggestion);
                }}
                className="text-xs md:text-sm bg-white/40 md:bg-white/60 hover:bg-white border border-sacred-gold/10 rounded-full px-5 py-2.5 text-sacred-text hover:text-sacred-gold transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
