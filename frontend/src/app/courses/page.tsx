"use client";

import { motion } from "framer-motion";
import { BookOpen, Search, Filter } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const COURSES = [
  { id: 1, title: "Foundations of Mindfulness", instructor: "Acharya Rama", duration: "6 Weeks", level: "Beginner" },
  { id: 2, title: "The Path of Bhakti", instructor: "Sri Devi", duration: "4 Weeks", level: "Intermediate" },
  { id: 3, title: "Ayurvedic Living", instructor: "Dr. Varma", duration: "8 Weeks", level: "All Levels" },
];

export default function CoursesPage() {
  return (
    <div className="max-w-6xl mx-auto py-16 px-6 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-serif font-bold text-sacred-text">Sacred Pathways</h1>
          <p className="text-sacred-muted italic">Guided journeys into the heart of wisdom.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-sacred-border rounded-full px-4 py-2 shadow-sm">
            <Search size={18} className="text-sacred-muted" />
            <input type="text" placeholder="Search paths..." className="bg-transparent border-none outline-none text-sm ml-2 w-48 font-medium" />
          </div>
          <Button variant="secondary" className="rounded-full">
            <Filter size={18} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {COURSES.map((course) => (
          <motion.div key={course.id} whileHover={{ y: -5 }}>
            <Card className="p-8 h-full flex flex-col hover:shadow-xl transition-all border-sacred-gold/5 bg-white">
              <div className="w-12 h-12 rounded-2xl bg-sacred-gold/10 flex items-center justify-center text-sacred-gold mb-6">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-bold text-sacred-text mb-2 leading-tight">{course.title}</h3>
              <p className="text-sacred-muted text-sm mb-6 flex-1 italic font-serif">By {course.instructor}</p>
              <div className="flex items-center justify-between pt-6 border-t border-sacred-gold/10">
                <span className="text-[10px] uppercase font-bold tracking-widest text-sacred-muted/60">{course.duration}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-sacred-gold bg-sacred-gold/10 px-2 py-1 rounded">{course.level}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
