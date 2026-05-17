'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, X, Save, Check } from 'lucide-react';

interface GuideNotesProps {
  sessionId: string;
}

const NOTES_KEY = 'guide_notes_';

export function GuideNotes({ sessionId }: GuideNotesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem(NOTES_KEY + sessionId) || '';
    return '';
  });
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = () => {
    localStorage.setItem(NOTES_KEY + sessionId, note);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 top-28 z-40 p-2.5 bg-white/90 backdrop-blur-sm border border-[#D4AF37]/20 rounded-xl shadow-lg text-[#B8860B] hover:bg-[#FBF7E9] transition-all"
        title="Private Notes"
      >
        <StickyNote size={18} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 bg-white/95 backdrop-blur-md border-l border-[#D4AF37]/10 shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <StickyNote size={16} className="text-[#D4AF37]" />
                <h3 className="font-bold text-slate-800 text-sm">Private Notes</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 p-4">
              <textarea
                ref={textareaRef}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Observations, intuitions, practices to suggest..."
                className="w-full h-full bg-slate-50 rounded-xl p-4 text-sm text-slate-700 border border-slate-200 focus:border-[#D4AF37]/30 focus:outline-none resize-none placeholder:text-slate-300 leading-relaxed"
              />
            </div>

            <div className="p-4 border-t border-slate-100">
              <button
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#B8860B] transition-colors"
              >
                {saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save Notes</>}
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-2">Stored locally, visible only to you</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
