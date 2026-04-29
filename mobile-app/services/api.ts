import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { ApiDoubt, ApiSubject, ApiUser, Doubt, Role, StatsSummary, Subject, User } from '@/types';

const DEFAULT_API_BASE = Platform.select({
  android: 'http://10.0.2.2:5000/api',
  ios: 'http://localhost:5000/api',
  default: 'http://localhost:5000/api',
});

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_API_BASE;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  const userData = await AsyncStorage.getItem('user');
  if (userData) {
    const { token } = JSON.parse(userData);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

const normalizeRole = (role?: string): Role => {
  if (role === 'tutor' || role === 'faculty') {
    return 'faculty';
  }

  if (role === 'admin') {
    return 'admin';
  }

  return 'student';
};

export const normalizeUser = (user: ApiUser | User): User => ({
  id: (user as ApiUser)._id || user.id || '',
  name: user.name,
  email: user.email,
  role: normalizeRole(user.role),
  isApproved: user.isApproved,
  isVerified: user.isVerified,
  isActive: user.isActive,
});

export const normalizeSubject = (subject: ApiSubject): Subject => ({
  _id: subject._id || subject.id || '',
  subjectName: subject.subjectName || subject.name || 'Subject',
  description: subject.description || '',
});

const normalizeStatus = (status?: string): Doubt['status'] => {
  const lowered = (status || '').toLowerCase();

  if (lowered === 'resolved') {
    return 'RESOLVED';
  }

  if (lowered === 'claimed' || lowered === 'in-progress' || lowered === 'submitted') {
    return 'CLAIMED';
  }

  return 'OPEN';
};

export const normalizeDoubt = (doubt: ApiDoubt): Doubt => ({
  _id: doubt._id || doubt.id || '',
  title: doubt.title,
  description: doubt.description,
  status: normalizeStatus(doubt.status),
  subjectId: {
    subjectName:
      typeof doubt.subjectId === 'object'
        ? doubt.subjectId.subjectName || doubt.subjectId.name || 'Subject'
        : 'Subject',
  },
  studentId: {
    name:
      typeof doubt.studentId === 'object'
        ? doubt.studentId.name || 'Student'
        : 'Student',
  },
  facultyId: (() => {
    const source = doubt.facultyId || doubt.tutorId;
    if (!source || typeof source !== 'object') {
      return undefined;
    }
    return { name: source.name || 'Faculty' };
  })(),
  answer: doubt.answer || doubt.solution || '',
  createdAt: doubt.createdAt || new Date().toISOString(),
  updatedAt: doubt.updatedAt,
});

export const getRoleDashboardPath = (role?: string) => {
  const normalized = normalizeRole(role);

  if (normalized === 'faculty') {
    return '/(faculty)/dashboard';
  }

  if (normalized === 'admin') {
    return '/(admin)/dashboard';
  }

  return '/(student)/dashboard';
};

export const loginRequest = async (payload: { email: string; password: string }) => {
  const { data } = await api.post('/auth/login', payload);
  return {
    token: data.token as string,
    user: normalizeUser(data.user),
    message: data.message as string | undefined,
  };
};

export const registerRequest = async (payload: { name: string; email: string; password: string; role: Role }) => {
  const backendRole = payload.role === 'faculty' ? 'tutor' : payload.role;
  const { data } = await api.post('/auth/register', {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    confirmPassword: payload.password,
    role: backendRole,
  });

  return {
    token: data.token as string | undefined,
    user: data.user ? normalizeUser(data.user) : undefined,
    message: data.message as string | undefined,
    requiresOTPVerification: Boolean(data.requiresOTPVerification),
  };
};

export const getSubjectsRequest = async (): Promise<Subject[]> => {
  const { data } = await api.get('/subjects');
  return (data.subjects || []).map(normalizeSubject);
};

export const getAdminSubjectsRequest = async (): Promise<Subject[]> => {
  const { data } = await api.get('/admin/subjects');
  return (data.subjects || []).map(normalizeSubject);
};

export const createSubjectRequest = async (payload: { subjectName: string; description?: string }) => {
  const { data } = await api.post('/admin/subjects', {
    name: payload.subjectName,
    branch: 'CSE',
    description: payload.description || '',
  });

  return normalizeSubject(data.subject);
};

export const deleteSubjectRequest = async (id: string) => {
  await api.delete(`/admin/subjects/${id}`);
};

export const postDoubtRequest = async (payload: { subjectId: string; title: string; description: string }) => {
  const { data } = await api.post('/doubts', payload);
  return data.doubt ? normalizeDoubt(data.doubt) : undefined;
};

export const getMyDoubtsRequest = async (): Promise<Doubt[]> => {
  const { data } = await api.get('/doubts/my/all');
  return (data.doubts || []).map(normalizeDoubt);
};

export const getOpenDoubtsRequest = async (): Promise<Doubt[]> => {
  const { data } = await api.get('/doubts/open/all');
  return (data.doubts || []).map(normalizeDoubt);
};

export const claimDoubtRequest = async (id: string): Promise<Doubt> => {
  const { data } = await api.put(`/doubts/${id}/claim`);
  return normalizeDoubt(data.doubt);
};

export const answerDoubtRequest = async (id: string, answer: string): Promise<Doubt> => {
  const { data } = await api.post(`/doubts/${id}/answer`, { solution: answer });
  return normalizeDoubt(data.doubt);
};

export const getKnowledgeBaseRequest = async (query: string): Promise<Doubt[]> => {
  const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : '';
  const { data } = await api.get(`/doubts/knowledge${params}`);
  return (data.doubts || []).map(normalizeDoubt);
};

export const getStatsRequest = async (): Promise<StatsSummary> => {
  const { data } = await api.get('/admin/stats');
  return {
    totalUsers: data.stats?.totalUsers || 0,
    totalDoubts: data.stats?.totalDoubts || 0,
    open: data.stats?.openDoubts || 0,
    claimed: Math.max((data.stats?.totalDoubts || 0) - (data.stats?.openDoubts || 0) - (data.stats?.resolvedDoubts || 0), 0),
    resolved: data.stats?.resolvedDoubts || 0,
    subjects: data.stats?.totalSubjects || 0,
  };
};

export const getUsersRequest = async (): Promise<User[]> => {
  const { data } = await api.get('/admin/users');
  return (data.users || []).map(normalizeUser);
};

export const deleteUserRequest = async (id: string) => {
  await api.delete(`/admin/users/${id}`);
};

export default api;
