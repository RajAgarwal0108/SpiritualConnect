'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, ChevronRight, Zap, History, MessageSquare, Activity } from 'lucide-react';

interface QuestionMetadata {
  question: string;
  category: 'Reflection' | 'Inventory' | 'Intention' | 'Immediate';
}

interface QuestionCardProps {
  metadata: QuestionMetadata;
  onClick?: () => void;
}

const catColors = {
  Reflection: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  Inventory: 'bg-amber-50 text-amber-700 border-amber-100',
  Intention: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Immediate: 'bg-rose-50 text-rose-700 border-rose-100'
};

const catIcons = {
  Reflection: History,
  Inventory: Activity,
  Intention: Zap,
  Immediate: MessageSquare
};

export function QuestionCard({ metadata, onClick }: QuestionCardProps) {
  const Icon = catIcons[metadata.category || 'Reflection'];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      className="max-w-md w-full my-4 cursor-pointer"
      onClick={onClick}
    >
      <Card className="border-l-4 border-l-[#D4AF37] border-slate-100 shadow-md hover:shadow-xl transition-all duration-300">
        <div className="flex flex-row items-center gap-4 space-y-0 py-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[#D4AF37]">
            <HelpCircle size={28} className="animate-pulse" />
          </div>
          <div className="flex-1">
            <Badge variant="outline" className={`${catColors[metadata.category]} border-none mb-1 font-medium`}>
              <Icon size={12} className="mr-1" /> {metadata.category}
            </Badge>
            <h4 className="text-lg font-serif italic text-slate-800 leading-tight">
              "{metadata.question}"
            </h4>
          </div>
          <ChevronRight className="text-slate-300" size={24} />
        </div>
      </Card>
    </motion.div>
  );
}
