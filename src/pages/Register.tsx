import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Card, CardBody, CardHeader } from '../components/Card';
import { GraduationCap } from 'lucide-react';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

export function Register({ onSwitchToLogin }: RegisterProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const codeToSend = role === 'admin' ? inviteCode.trim() : undefined;
      await signUp(email.trim(), password, fullName.trim(), role, codeToSend);
      alert('Registration successful! Please sign in.');
      onSwitchToLogin();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex flex-col items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-xl">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
              <p className="text-sm text-gray-500 mt-1">Join Academic Query Hub today</p>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
            />

            <Select
              label="Register As"
              value={role}
              onChange={(e) => setRole(e.target.value as 'student' | 'faculty' | 'admin')}
              options={[
                { value: 'student', label: 'Student' },
                { value: 'faculty', label: 'Faculty' },
                { value: 'admin', label: 'Admin' },
              ]}
            />

            {role === 'admin' && (
              <Input
                label="Admin Invite Code"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter admin invite code"
                required
              />
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Create Account
            </Button>

            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
