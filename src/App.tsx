import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { StudentDashboard } from './pages/StudentDashboard';
import { FacultyDashboard } from './pages/FacultyDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

function AppContent() {
  const { user, profile, loading, connectionError } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {connectionError && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4">
          <p>{connectionError}</p>
        </div>
      )}

      {!user || !profile ? (
        showLogin ? (
          <Login onSwitchToRegister={() => setShowLogin(false)} />
        ) : (
          <Register onSwitchToLogin={() => setShowLogin(true)} />
        )
      ) : (
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          {profile.role === 'student' && <StudentDashboard />}
          {profile.role === 'faculty' && <FacultyDashboard />}
          {profile.role === 'admin' && <AdminDashboard />}
        </div>
      )}
    </div>
  );



}

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </AuthProvider>
  );
} 

export default App;
