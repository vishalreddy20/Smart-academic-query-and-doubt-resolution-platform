import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LoginResponse,
  RegisterResponse,
  DoubtsResponse,
  SubjectsResponse,
  UsersResponse,
  StatsResponse,
  Doubt,
  Subject,
} from '../types';

// For Android emulator use 10.0.2.2, for physical device use your machine's WiFi IP
const API_BASE = 'http://192.168.1.41:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT from AsyncStorage
api.interceptors.request.use(
  async (config) => {
    try {
      const raw = await AsyncStorage.getItem('smartdoubt_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      }
    } catch {
      // token read failed — continue unauthenticated
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('smartdoubt_user');
    }
    return Promise.reject(error);
  }
);

// ────────────────────────────────────────────────────────────
// AUTH
// ────────────────────────────────────────────────────────────
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  register: async (
    name: string,
    email: string,
    password: string,
    role: string
  ): Promise<RegisterResponse> => {
    const { data } = await api.post('/auth/register', {
      name,
      email,
      password,
      confirmPassword: password,
      role,
    });
    return data;
  },

  registerAdmin: async (
    name: string,
    email: string,
    password: string,
    adminCode: string
  ): Promise<RegisterResponse> => {
    const { data } = await api.post('/auth/register-admin', {
      name,
      email,
      password,
      confirmPassword: password,
      adminCode,
    });
    return data;
  },

  verifyOtp: async (email: string, otp: string): Promise<LoginResponse> => {
    const { data } = await api.post('/auth/verify-otp', { email, otp });
    return data;
  },

  resendOtp: async (email: string) => {
    const { data } = await api.post('/auth/resend-otp', { email });
    return data;
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data;
  },
};

// ────────────────────────────────────────────────────────────
// DOUBTS
// ────────────────────────────────────────────────────────────
export const doubtsApi = {
  getMyDoubts: async (): Promise<DoubtsResponse> => {
    const { data } = await api.get('/doubts/my/all');
    return data;
  },

  getOpenDoubts: async (): Promise<DoubtsResponse> => {
    const { data } = await api.get('/doubts/open/all');
    return data;
  },

  getClaimedDoubts: async (): Promise<DoubtsResponse> => {
    const { data } = await api.get('/doubts/claimed/all');
    return data;
  },

  getResolvedByTutor: async (): Promise<DoubtsResponse> => {
    const { data } = await api.get('/doubts/resolved/all');
    return data;
  },

  getDoubtDetail: async (id: string): Promise<{ doubt: Doubt }> => {
    const { data } = await api.get(`/doubts/${id}`);
    return data;
  },

  postDoubt: async (
    subjectId: string,
    title: string,
    description: string
  ): Promise<{ message: string; doubt: Doubt }> => {
    const { data } = await api.post('/doubts', { subjectId, title, description });
    return data;
  },

  claimDoubt: async (id: string): Promise<{ message: string; doubt: Doubt }> => {
    const { data } = await api.put(`/doubts/${id}/claim`);
    return data;
  },

  answerDoubt: async (
    id: string,
    solution: string
  ): Promise<{ message: string; doubt: Doubt }> => {
    const { data } = await api.post(`/doubts/${id}/answer`, { solution });
    return data;
  },

  submitSolution: async (
    id: string,
    solution: string
  ): Promise<{ message: string; doubt: Doubt }> => {
    const { data } = await api.put(`/doubts/${id}/submit`, { solution });
    return data;
  },

  deleteDoubt: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/doubts/${id}`);
    return data;
  },

  searchKnowledgeBase: async (query?: string): Promise<DoubtsResponse> => {
    const params = query ? { q: query } : {};
    const { data } = await api.get('/doubts/knowledge', { params });
    return data;
  },

  searchDoubts: async (query: string): Promise<DoubtsResponse> => {
    const { data } = await api.get('/doubts/search', { params: { q: query } });
    return data;
  },
};

// ────────────────────────────────────────────────────────────
// SUBJECTS (public)
// ────────────────────────────────────────────────────────────
export const subjectsApi = {
  getSubjects: async (): Promise<SubjectsResponse> => {
    const { data } = await api.get('/subjects');
    return data;
  },
};

// ────────────────────────────────────────────────────────────
// ADMIN
// ────────────────────────────────────────────────────────────
export const adminApi = {
  getStats: async (): Promise<StatsResponse> => {
    const { data } = await api.get('/admin/stats');
    return data;
  },

  getAllUsers: async (): Promise<UsersResponse> => {
    const { data } = await api.get('/admin/users');
    return data;
  },

  deleteUser: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/admin/users/${id}`);
    return data;
  },

  getAllSubjects: async (): Promise<SubjectsResponse> => {
    const { data } = await api.get('/admin/subjects');
    return data;
  },

  createSubject: async (
    name: string,
    branch: string,
    description?: string
  ): Promise<{ message: string; subject: Subject }> => {
    const { data } = await api.post('/admin/subjects', { name, branch, description });
    return data;
  },

  deleteSubject: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/admin/subjects/${id}`);
    return data;
  },
};

export default api;
