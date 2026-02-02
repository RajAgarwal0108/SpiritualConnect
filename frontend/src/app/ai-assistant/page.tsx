"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, ExternalLink, BookOpen, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import api from "@/services/api";
import Link from "next/link";

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
    try {
      console.log("Sending query:", question);
      const res = await api.post("/ai/query", { question });
      console.log("AI Response:", res.data);
      
      if (!res.data) {
        setError("No response from Oracle. Please try again.");
        return;
      }
      
      setResponse(res.data);
      setHistory([...history, { q: question, r: res.data }]);
      setQuestion("");
    } catch (error: any) {
      console.error("AI Query failed:", error);
      const errorMsg = error.response?.data?.error || error.message || "Failed to query the Oracle";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <Sparkles className="mx-auto text-sacred-gold animate-pulse" size={48} />
        <h1 className="text-4xl font-serif font-bold text-sacred-text">Vedic Oracle</h1>
        <p className="text-sacred-muted italic max-w-2xl mx-auto">
          Ask the ancient wisdom combined with insights from your spiritual community. 
          The Oracle searches sacred texts and your website for authentic guidance.
        </p>
      </div>

      <Card className="p-8 space-y-6 bg-white/50 backdrop-blur-xl border-sacred-gold/10">
        {/* Input Section */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-sacred-text">Your Question</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleQuery()}
              placeholder="What weighs on your soul? (e.g., 'What is karma?', 'How to meditate?')"
              className="flex-1 bg-white border border-sacred-gold/10 rounded-2xl px-6 py-3 text-sacred-text placeholder:text-sacred-muted/40 focus:outline-none focus:ring-2 focus:ring-sacred-gold/20"
            />
            <Button
              onClick={handleQuery}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
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
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-sacred-text">Oracle's Wisdom</h3>
              <div className="bg-sacred-beige/30 rounded-xl p-6 text-sacred-text leading-relaxed whitespace-pre-wrap font-serif italic">
                {response.answer}
              </div>
            </div>

            {/* Spiritual Texts Results */}
            {response.spiritualTexts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-sacred-gold" />
                  <h3 className="text-lg font-semibold text-sacred-text">Sacred Texts</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {response.spiritualTexts.map((text, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/60 border border-sacred-gold/10 rounded-xl p-4 hover:shadow-md transition"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-bold text-sacred-text">{text.title}</h4>
                            <p className="text-xs text-sacred-muted font-medium">{text.source}</p>
                          </div>
                        </div>
                        <p className="text-sm text-sacred-text leading-relaxed line-clamp-3">{text.content}</p>
                        <div className="flex flex-wrap gap-1 pt-2">
                          {text.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[10px] bg-sacred-gold/10 text-sacred-gold px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Website Content Results */}
            {response.websiteContent.posts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-sacred-gold" />
                  <h3 className="text-lg font-semibold text-sacred-text">Related Community Content</h3>
                </div>
                <div className="space-y-3">
                  {response.websiteContent.posts.map((post, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link href={post.link}>
                        <div className="bg-white/60 border border-sacred-gold/10 rounded-xl p-4 hover:shadow-md transition group cursor-pointer">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-sacred-text truncate group-hover:text-sacred-gold transition">
                                {post.title}
                              </p>
                              <p className="text-[11px] text-sacred-muted mt-1">
                                by {post.author} {post.community && `• ${post.community}`}
                              </p>
                            </div>
                            <ExternalLink size={16} className="text-sacred-gold/60 group-hover:text-sacred-gold shrink-0 transition" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!response && !loading && (
          <div className="text-center py-12 text-sacred-muted italic font-serif">
            <p>Ask your question and the Oracle will search spiritual wisdom and your community insights.</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 size={32} className="animate-spin text-sacred-gold mx-auto" />
              <p className="text-sacred-muted italic font-serif">The Oracle is meditating on your question...</p>
            </div>
          </div>
        )}
      </Card>

      {/* Suggestions */}
      {!response && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-sacred-text uppercase tracking-widest text-center">Try asking about:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              "What is karma?",
              "How to meditate?",
              "What is dharma?",
              "Buddhist paths",
              "Yoga practices",
              "Enlightenment"
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setQuestion(suggestion);
                  setTimeout(() => handleQuery(), 100);
                }}
                className="text-sm bg-white/60 hover:bg-white border border-sacred-gold/10 rounded-2xl px-4 py-3 text-sacred-text hover:text-sacred-gold transition"
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
