import { Timestamp } from "firebase/firestore";

// Types communs pour l'application
export type User = {
  id: string;
  pseudo: string;
  prenom: string;
  age: number;
  ville: string;
  email: string;
  createdAt?: string | Timestamp;
  updatedAt?: string | Timestamp;
  status: 'active' | 'inactive';
  role: 'admin' | 'user' | 'editor';
  favoris?: string[];
  lastLogin?: string | Timestamp;
  votesCount?: number;
  suggestionsCount?: number;
};

export type Word = {
  id: string;
  text: string;
  definition: string;
  exemple?: string;
  origine?: string;
  createdAt?: string | Timestamp;
  updatedAt?: string | Timestamp;
  status: 'active' | 'pending' | 'rejected';
  createdBy?: string;
  likesCount: number;
  viewsCount: number;
  tags?: string[];
};

export type Vote = {
  id: string;
  userId: string;
  wordId: string;
  value: number; // 1 pour like, -1 pour dislike
  createdAt?: string | Timestamp;
};

export type Suggestion = {
  id: string;
  userId: string;
  wordId?: string;
  text: string;
  definition: string;
  exemple?: string;
  origine?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string | Timestamp;
  updatedAt?: string | Timestamp;
  reviewedBy?: string;
  reviewNote?: string;
};

export type UserFormData = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin' | 'votesCount' | 'suggestionsCount'>;

export type WordFormData = Omit<Word, 'id' | 'createdAt' | 'updatedAt' | 'likesCount' | 'viewsCount'>;

export type SuggestionFormData = Omit<Suggestion, 'id' | 'createdAt' | 'updatedAt' | 'reviewedBy' | 'reviewNote' | 'status'> & {
  status?: 'pending' | 'approved' | 'rejected';
};

export type StatsData = {
  totalUsers: number;
  activeUsers: number;
  totalWords: number;
  totalVotes: number;
  pendingSuggestions: number;
  votesByDate: Array<{date: string; count: number}>;
  topWords: Array<{id: string; text: string; likesCount: number}>;
};

export type SuggestionStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  approvalRate: number;
};

export interface WordOfTheDay {
  id: string;
  word: Word;
  definition?: string;
  example?: string;
  date: string;
  viewCount?: number;
  createdAt?: any;
  updatedAt?: any;
  status?: 'active' | 'inactive';
} 