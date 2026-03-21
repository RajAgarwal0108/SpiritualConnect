'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Sparkles, ArrowRight, Activity, Moon, Sun, Heart } from 'lucide-react';

interface RoutineMetadata {
  title: string;
  duration?: string;
  steps?: string[];
  focus?: 'Healing' | 'Strength' | 'Clarity' | 'Peace';
}

interface RoutineCardProps {
  metadata: RoutineMetadata;
  onAccept?: () => void;
}

const focusColors = {
  Healing: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Strength: 'bg-amber-50 text-amber-700 border-amber-100',
  Clarity: 'bg-blue-50 text-blue-700 border-blue-100',
  Peace: 'bg-purple-50 text-purple-700 border-purple-100'
};

const focusIcons = {
  Healing: Heart,
  Strength: Activity,
  Clarity: Sun,
  Peace: Moon
};

export function RoutineCard({ metadata, onAccept }: RoutineCardProps) {
  const Icon = focusIcons[metadata.focus || 'Peace'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md w-full my-4"
    >
      <Card className="border-2 border-[#D4AF37]/20 bg-white/80 backdrop-blur-sm overflow-hidden shadow-xl">
        <div className="h-1 bg-linear-to-r from-[#D4AF37] to-[#B8860B]" />

        <div className="pb-2">
          <div className="flex justify-between items-start mb-2 text-xs font-semibold tracking-wider text-[#B8860B] uppercase">
            <span className="flex items-center gap-1">
              <Sparkles size={14} /> Sacred Practice
            </span>
            {metadata.duration && <span>{metadata.duration}</span>}
          </div>
          <h3 className="text-xl font-bold text-slate-800 leading-tight">
            {metadata.title}
          </h3>
          {metadata.focus && (
            <Badge className={`${focusColors[metadata.focus]} border mt-1 shadow-none font-medium`}>
              <Icon size={12} className="mr-1" /> {metadata.focus}
            </Badge>
          )}
        </div>

        <div className="space-y-4 pt-2">
          {metadata.steps && (
            <div className="space-y-3">
              {metadata.steps.map((step, idx) => (
                <div key={idx} className="flex gap-3 group">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#B8860B] font-serif text-sm border border-[#D4AF37]/20">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed pt-0.5">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          )}

          <Button 
            onClick={onAccept}
            className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-white shadow-lg shadow-[#D4AF37]/20 transition-all duration-300 group rounded-xl"
          >
            I will embrace this practice
            <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
