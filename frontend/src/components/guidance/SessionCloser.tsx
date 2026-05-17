'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send } from 'lucide-react';

interface SessionCloserProps {
  onClose: (summary: string, blessing: string) => void;
  isPending: boolean;
}

const blessings = [
  'May you walk in peace and carry this light within.',
  'You are held, you are seen, you are whole.',
  'Trust the unfolding. The path is already beneath you.',
  'Return to the breath, always. It is your anchor.',
  'You have everything you need within you.',
];

export function SessionCloser({ onClose, isPending }: SessionCloserProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [blessing, setBlessing] = useState(blessings[0]);

  const handleSubmit = () => {
    if (!summary.trim()) return;
    onClose(summary.trim(), blessing);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl text-xs font-bold hover:from-slate-800 hover:to-slate-900 transition-all shadow-md"
      >
        <Sparkles size={14} /> Close with Blessing
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FBF7E9] to-[#F1E4C3] flex items-center justify-center text-[#D4AF37]">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Complete This Session</h3>
                    <p className="text-xs text-slate-500">Offer a closing summary and blessing</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Session Summary
                  </label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="What was explored, what practices were shared, what insights emerged..."
                    rows={4}
                    className="w-full bg-slate-50 rounded-xl p-4 text-sm text-slate-700 border border-slate-200 focus:border-[#D4AF37]/30 focus:outline-none resize-none placeholder:text-slate-300 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Closing Blessing
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {blessings.map((b) => (
                      <button
                        key={b}
                        onClick={() => setBlessing(b)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          blessing === b
                            ? 'bg-[#FBF7E9] border-[#D4AF37]/30 text-[#B8860B] font-bold'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {b.slice(0, 30)}...
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={blessing}
                    onChange={(e) => setBlessing(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 rounded-xl p-3 text-sm text-slate-700 border border-slate-200 focus:border-[#D4AF37]/30 focus:outline-none resize-none placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!summary.trim() || isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-xl text-sm font-bold shadow-md shadow-[#D4AF37]/20 hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending ? 'Closing...' : <><Send size={14} /> Complete & Bless</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
