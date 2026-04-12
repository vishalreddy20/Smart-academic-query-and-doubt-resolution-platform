export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'student' | 'tutor' | 'admin';
  profilePic?: string | null;
  isVerified?: boolean;
  isApproved?: boolean;
  isPremiumActive?: boolean;
  rating?: number | null;
  totalDoubtsResolved?: number;
  totalEarnings?: number;
  phone?: string;
  college?: string;
  branch?: string;
  graduationYear?: string;
  expertise?: string[];
  subscriptionTier?: string;
  subscriptionExpiry?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subject {
  _id: string;
  name: string;
  description?: string;
  branch?: string;
  icon?: string | null;
  color?: string;
  isActive?: boolean;
  doubtsCount?: number;
  tutorsCount?: number;
}

export interface Doubt {
  _id: string;
  title: string;
  description: string;
  status: 'open' | 'claimed' | 'in-progress' | 'submitted' | 'resolved' | 'disputed';
  difficulty?: 'easy' | 'medium' | 'hard';
  subjectId: Subject | { _id: string; name: string };
  studentId: { _id: string; name: string; profilePic?: string; college?: string; branch?: string };
  tutorId?: { _id: string; name: string; profilePic?: string; rating?: number } | null;
  solution?: string | null;
  solutionFiles?: string[];
  attachments?: string[];
  tags?: string[];
  studentRating?: number | null;
  studentFeedback?: string | null;
  tutorComments?: string | null;
  deadline?: string | null;
  views?: number;
  priorityScore?: number;
  responseTime?: number | null;
  slaBreached?: boolean;
  reopenCount?: number;
  isReopened?: boolean;
  createdAt: string;
  updatedAt: string;
  claimedAt?: string | null;
  submittedAt?: string | null;
  resolvedAt?: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
  requiresOTPVerification?: boolean;
}

export interface RegisterResponse {
  message: string;
  userId?: string;
  email?: string;
  requiresOTPVerification?: boolean;
  token?: string;
  user?: User;
}

export interface DoubtsResponse {
  doubts: Doubt[];
  count: number;
}

export interface SubjectsResponse {
  subjects: Subject[];
  count?: number;
}

export interface UsersResponse {
  users: User[];
  count: number;
}

export interface StatsResponse {
  stats: {
    totalUsers: number;
    totalStudents: number;
    totalTutors: number;
    approvedTutors: number;
    verifiedUsers: number;
    totalDoubts: number;
    openDoubts: number;
    resolvedDoubts: number;
    totalSubjects: number;
    totalRevenue: number;
    premiumUsers: number;
  };
}
