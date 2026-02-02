export interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  createdAt: string;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  postId: number;
  authorId: number;
  parentId?: number | null;
  author: {
    id: number;
    name: string;
    profile?: {
      avatar?: string;
    };
  };
  replies?: Comment[];
}

export interface Post {
  id: number;
  content: string;
  media?: string;
  createdAt: string;
  communityId?: number;
  community?: {
    id: number;
    name: string;
  };
  author: {
    id: number;
    name: string;
    profile?: {
      avatar?: string;
    };
  };
  comments?: Comment[];
  isLiked?: boolean;
  isBookmarked?: boolean;
  _count?: {
    comments: number;
    likes: number;
    bookmarks: number;
  };
}

export interface Profile {
  id: number;
  bio?: string;
  avatar?: string;
  userId: number;
}

export interface Community {
  id: number;
  name: string;
  description: string;
  image?: string;
  _count?: {
    members: number;
    posts: number;
  };
}

export interface UserProfile extends User {
  profile?: Profile;
  memberships?: {
    community: Community;
  }[];
  _count: {
    posts: number;
    memberships: number;
    followers: number;
    following: number;
  };
}
