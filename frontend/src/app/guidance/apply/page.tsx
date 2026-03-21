'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { guidanceService } from '@/services/guidance.service';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '@/services/api';

export default function GuideApplicationPage() {
  const router = useRouter();
  const [reportText, setReportText] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const applyMutation = useMutation({
    mutationFn: guidanceService.applyForGuide,
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      router.push('/guidance');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to submit application');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText) {
      toast.error('Why do you want to be a guide? is required.');
      return;
    }

    try {
      let documentUrl = null;
      if (file) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        documentUrl = uploadRes.data.url;
        setIsUploading(false);
      }

      applyMutation.mutate({ reportText, title, bio, documentUrl });
    } catch (err) {
      setIsUploading(false);
      toast.error('File upload failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Become a Guide</h1>
      <p className="text-gray-600 mb-8 border-b pb-6">
        Apply to become a verified spiritual guide. Our team will review your application and credentials before granting you guide status.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Guide Title
          </label>
          <input 
            type="text"
            className="w-full p-3 border rounded-lg focus:ring focus:ring-indigo-200 focus:border-indigo-500"
            placeholder="e.g. Meditation Coach, Yoga Instructor"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brief Bio
          </label>
          <textarea 
            className="w-full p-3 border rounded-lg focus:ring focus:ring-indigo-200 focus:border-indigo-500"
            placeholder="A short introduction about your practice and approach..."
            rows={3}
            value={bio}
            onChange={e => setBio(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Why do you want to be a guide? (Required) <span className="text-red-500">*</span>
          </label>
          <textarea 
            className="w-full p-3 border rounded-lg focus:ring focus:ring-indigo-200 focus:border-indigo-500"
            placeholder="Outline your journey, your qualifications, and why you wish to guide others..."
            rows={6}
            value={reportText}
            onChange={e => setReportText(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Credentials / Resume (.pdf, .jpg, .png)
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <span className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </span>
                <p className="text-xs text-gray-500">{file ? file.name : "Supported files: JPG, PNG, PDF"}</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="application/pdf,image/jpeg,image/png"
                onChange={e => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFile(e.target.files[0]);
                  }
                }} 
              />
            </label>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={applyMutation.isPending || isUploading}
          className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {isUploading ? 'Uploading credentials...' : applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}