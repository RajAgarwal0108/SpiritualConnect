import api from './api';
import { Guide, GuidanceSession, GuidanceMessage, GuideApplication } from '../types/guidance';

export const guidanceService = {
  // Application & Discovery
  applyForGuide: async (data: { reportText: string; documentUrl?: string | null; title?: string; bio?: string }) => {
    const response = await api.post('/guidance/apply', data);
    return response.data;
  },
  
  getGuides: async (): Promise<Guide[]> => {
    const response = await api.get('/guidance/guides');
    return response.data;
  },

  getGuideById: async (id: number): Promise<Guide> => {
    const response = await api.get(`/guidance/guides/${id}`);
    return response.data;
  },

  // Sessions
  requestSession: async (guideId: number) => {
    const response = await api.post('/guidance/request', { guideId });
    return response.data;
  },

  getSessions: async (): Promise<GuidanceSession[]> => {
    const response = await api.get('/guidance/sessions');
    return response.data;
  },

  getIncomingSessions: async (): Promise<GuidanceSession[]> => {
    const response = await api.get('/guidance/sessions/incoming');
    return response.data;
  },

  respondToSession: async (sessionId: string, status: 'ACCEPTED' | 'REJECTED') => {
    const response = await api.patch(`/guidance/sessions/${sessionId}/respond`, { status });
    return response.data;
  },

  getSessionMessages: async (sessionId: string): Promise<GuidanceMessage[]> => {
    const response = await api.get(`/guidance/sessions/${sessionId}/messages`);
    return response.data;
  },

  shareSessionDetails: async (sessionId: string) => {
    const response = await api.patch(`/guidance/sessions/${sessionId}/share-details`);
    return response.data;
  },

  updateSessionIntent: async (sessionId: string, data: { mood?: string; goal?: string; summary?: string }) => {
    const response = await api.patch(`/guidance/sessions/${sessionId}/intent`, data);
    return response.data;
  },

  // Admin Api
  getAdminApplications: async (): Promise<GuideApplication[]> => {
    const response = await api.get('/admin/guide-applications');
    return response.data;
  },

  reviewAdminApplication: async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const response = await api.patch(`/admin/guide-applications/${id}`, { status });
    return response.data;
  },

  revokeGuideStatus: async (userId: number) => {
    const response = await api.delete(`/admin/guides/${userId}`);
    return response.data;
  }
};