import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminRegisterPage from './pages/AdminRegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import StudentDashboard from './pages/StudentDashboard';
import TutorDashboard from './pages/TutorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PostDoubtPage from './pages/PostDoubtPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import FacultyDashboard from './pages/FacultyDashboard';
import DoubtDetailPage from './pages/DoubtDetailPage';
import SubscriptionPage from './pages/SubscriptionPage';
import ProfilePage from './pages/ProfilePage';

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const hideNavbarOn = ['/', '/student', '/post-doubt', '/tutor', '/admin', '/faculty', '/knowledge-base'];
  const shouldHideNavbar = hideNavbarOn.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading Smart Doubts...</p>
        </div>
      </div>
    );
  }

  const getDashboard = () => {
    if (!user) return <LandingPage />;
    if (user.role === 'student') return <Navigate to="/student" />;
    if (user.role === 'tutor') return <Navigate to="/tutor" />;
    if (user.role === 'admin') return <Navigate to="/admin" />;
    return <LandingPage />;
  };

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={getDashboard()} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register-admin" element={<AdminRegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/knowledge-base" element={<KnowledgeBasePage />} />

        {/* Profile Route — all authenticated roles */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Doubt Detail — student and tutor can view */}
        <Route
          path="/doubt/:id"
          element={
            <ProtectedRoute>
              <DoubtDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post-doubt"
          element={
            <ProtectedRoute requiredRole="student">
              <PostDoubtPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription"
          element={
            <ProtectedRoute requiredRole="student">
              <SubscriptionPage />
            </ProtectedRoute>
          }
        />

        {/* Tutor Routes */}
        <Route
          path="/tutor"
          element={
            <ProtectedRoute requiredRole="tutor">
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Faculty (Legacy) */}
        <Route
          path="/faculty"
          element={
            <ProtectedRoute requiredRole="tutor">
              <Navigate to="/tutor" replace />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
