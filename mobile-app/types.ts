export type Role = 'student' | 'faculty' | 'admin';

export type DoubtStatus = 'OPEN' | 'CLAIMED' | 'RESOLVED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isApproved?: boolean;
  isVerified?: boolean;
  isActive?: boolean;
}

export interface Subject {
  _id: string;
  subjectName: string;
  description?: string;
}

export interface Doubt {
  _id: string;
  title: string;
  description: string;
  status: DoubtStatus;
  subjectId: { subjectName: string };
  studentId: { name: string };
  facultyId?: { name: string };
  answer?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
}

export interface StatsSummary {
  totalUsers: number;
  totalDoubts: number;
  open: number;
  claimed: number;
  resolved: number;
  subjects: number;
}

export interface ApiUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  isApproved?: boolean;
  isVerified?: boolean;
  isActive?: boolean;
}

export interface ApiSubject {
  _id?: string;
  id?: string;
  name?: string;
  subjectName?: string;
  description?: string;
  branch?: string;
}

export interface ApiDoubt {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  status: string;
  subjectId?: { subjectName?: string; name?: string } | string;
  studentId?: { name?: string } | string;
  facultyId?: { name?: string } | string | null;
  tutorId?: { name?: string } | string | null;
  answer?: string | null;
  solution?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
