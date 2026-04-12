import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('academicUser') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// ==================== AUTHENTICATION ====================
export const registerUser = (data) => API.post('/auth/register', data);
export const registerAdmin = (data) => API.post('/auth/register-admin', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const verifyOTP = (data) => API.post('/auth/verify-otp', data);
export const resendOTP = (data) => API.post('/auth/resend-otp', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const changePassword = (data) => API.put('/auth/change-password', data);
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);

// ==================== DOUBTS ====================
export const postDoubt = (data) => API.post('/doubts', data);
export const getMyDoubts = () => API.get('/doubts/my/all');
export const getOpenDoubts = () => API.get('/doubts/open/all');
export const getClaimedDoubts = () => API.get('/doubts/claimed/all');
export const getResolvedDoubts = () => API.get('/doubts/resolved/all'); // tutor resolved
export const getKnowledgeBase = (q, subject, difficulty) => {
  const params = new URLSearchParams();
  if (q) params.append('q', q);
  if (subject) params.append('subject', subject);
  if (difficulty) params.append('difficulty', difficulty);
  return API.get(`/doubts/knowledge?${params.toString()}`);
};
export const getDoubtDetail = (id) => API.get(`/doubts/${id}`);
export const claimDoubt = (id) => API.put(`/doubts/${id}/claim`);
export const submitSolution = (id, data) => API.put(`/doubts/${id}/submit`, data);
export const answerDoubt = (id, data) => submitSolution(id, { solution: data?.answer || data?.solution || '' });
export const rateSolution = (id, data) => API.put(`/doubts/${id}/rate`, data);
export const reopenDoubt = (id, data) => API.post(`/doubts/${id}/reopen`, data);
export const searchDoubts = (query) => API.get(`/doubts/search?q=${encodeURIComponent(query)}`);
export const deleteDoubt = (id) => API.delete(`/doubts/${id}`);

// ==================== PAYMENTS ====================
export const createPaymentOrder = (data) => API.post('/payments/create-order', data);
export const verifyPayment = (data) => API.post('/payments/verify', data);
export const getPaymentHistory = () => API.get('/payments/history');
export const getSubscription = () => API.get('/payments/subscription');
export const cancelSubscription = (data) => API.put('/payments/subscription/cancel', data || {});
export const initiateRefund = (data) => API.post('/payments/refund', data);

// ==================== PUBLIC SUPPORT DATA ====================
export const getSubjects = () => API.get('/subjects');

// ==================== ADMIN ====================
export const getStats = () => API.get('/admin/stats');
export const getAllUsers = () => API.get('/admin/users');
export const approveTutor = (id) => API.put(`/admin/users/${id}/approve`);
export const rejectTutor = (id, data) => API.put(`/admin/users/${id}/reject`, data);
export const deactivateUser = (id) => API.put(`/admin/users/${id}/deactivate`);
export const reactivateUser = (id) => API.put(`/admin/users/${id}/reactivate`);
export const deleteUserAdmin = (id) => API.delete(`/admin/users/${id}`);
export const createSubject = (data) => API.post('/admin/subjects', data);
export const getAllSubjects = () => API.get('/admin/subjects');
export const updateSubject = (id, data) => API.put(`/admin/subjects/${id}`, data);
export const deleteSubject = (id) => API.delete(`/admin/subjects/${id}`);
export const getPendingTutors = () => API.get('/admin/tutors/pending');
export const getRecentDoubtsData = () => API.get('/admin/doubts/recent');
export const getRecentPaymentsData = () => API.get('/admin/payments/recent');
