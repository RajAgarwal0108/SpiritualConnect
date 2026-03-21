'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { guidanceService } from '@/services/guidance.service';
import { useAuthStore } from '@/store/globalStore';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function GuidanceDirectoryPage() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: guides, isLoading } = useQuery({
    queryKey: ['guides'],
    queryFn: guidanceService.getGuides,
  });

  const filteredGuides = guides?.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.guideTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Spiritual Guides</h1>
          <p className="text-gray-600">Connect with verified spiritual guides and mentors.</p>
        </div>
        <div className="flex gap-4">
          {user?.isGuide && (
            <Link 
              href="/profile/guidance"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              My Dashboard
            </Link>
          )}
          {!user?.isGuide && (
            <Link 
              href="/guidance/apply"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Become a Guide
            </Link>
          )}
        </div>
      </div>

      <div className="mb-8">
        <input 
          type="text" 
          placeholder="Search by name or specialty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map(guide => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={guide.id}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition cursor-pointer"
            >
              <Link href={`/guidance/${guide.id}`}>
                <div className="p-6 flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-gray-100 ring-4 ring-indigo-50">
                    <img 
                      src={guide.profile?.avatar || '/default-avatar.png'} 
                      alt={guide.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{guide.name}</h3>
                  <p className="text-indigo-600 font-medium mb-3">{guide.guideTitle || 'Spiritual Guide'}</p>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {guide.guideBio || guide.profile?.bio || 'No bio provided.'}
                  </p>
                </div>
                <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 flex justify-center text-sm font-semibold text-indigo-600 hover:bg-gray-100 transition">
                  View Profile
                </div>
              </Link>
            </motion.div>
          ))}

          {filteredGuides.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              No guides found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
