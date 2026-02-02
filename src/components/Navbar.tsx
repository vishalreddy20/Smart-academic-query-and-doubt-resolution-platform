import { LogOut, User, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';

export function Navbar() {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const roleColors = {
    student: 'bg-blue-100 text-blue-800',
    faculty: 'bg-green-100 text-green-800',
    admin: 'bg-red-100 text-red-800',
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Academic Query Hub</h1>
              <p className="text-xs text-gray-500">Smart Doubt Resolution Platform</p>
            </div>
          </div>

          {profile && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{profile.full_name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[profile.role]}`}>
                    {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                  </span>
                </div>
                <div className="bg-gray-200 p-2 rounded-full">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
              </div>

              <Button variant="secondary" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
