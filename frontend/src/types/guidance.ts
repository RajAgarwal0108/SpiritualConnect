export interface Guide {
  id: number;
  name: string;
  guideTitle: string;
  guideBio: string | null;
  phoneNumber?: string;
  profile: {
    avatar: string | null;
    bio: string | null;
  };
}

export interface GuidanceSession {
  id: string;
  userId: number;
  guideId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  isDetailsShared: boolean;
  // Optional session intent metadata
  mood?: string | null;
  goal?: string | null;
  summary?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email?: string;
    phoneNumber?: string;
    profile: {
      avatar: string | null;
    };
  };
  guide?: {
    id: number;
    name: string;
    guideTitle: string;
    profile: {
      avatar: string | null;
    };
  };
}

export interface GuidanceMessage {
  id: string;
  sessionId: string;
  senderId: number;
  content: string;
  // Structured guidance message type (TEXT, ROUTINE, QUESTION, PROFILE_SHARE, etc.)
  type?: string;
  // Optional structured metadata for ROUTINE/QUESTION messages
  metadata?: any;
  createdAt: string;
}

export interface GuideApplication {
  id: string;
  userId: number;
  reportText: string;
  documentUrl: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}