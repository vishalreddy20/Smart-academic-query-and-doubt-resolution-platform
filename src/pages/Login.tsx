import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardBody, CardHeader } from '../components/Card';
import { GraduationCap } from 'lucide-react';
import LoginIllustration from '../components/LoginIllustration';
import LoginVideo from '../components/LoginVideo';

interface LoginProps {
  onSwitchToRegister: () => void;
}

export function Login({ onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center px-6 py-12 overflow-hidden bg-gradient-to-b from-slate-50 to-blue-50"
      style={{ backgroundImage: "url('/images/login-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
    >
      {/* Decorative soft background shapes (kept as subtle accents over the image) */}
      <div className="absolute inset-0 bg-black/8 pointer-events-none -z-10" />
      <div className="absolute -left-20 -top-20 w-[480px] h-[480px] bg-gradient-to-br from-blue-100/30 to-blue-300/10 rounded-full blur-3xl -z-20" />
      <div className="absolute -right-24 bottom-24 w-[360px] h-[360px] bg-gradient-to-br from-pink-50/20 to-indigo-50/5 rounded-full blur-2xl -z-20" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 items-center gap-8">
        <motion.div
          className="flex md:justify-center justify-center items-start"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
          transition={{ duration: 0.6, y: { duration: 4, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' } }}
        >
          <LoginVideo src="/videos/loginPage.mp4" preloadOnMount className="md:mt-0 mt-4" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="w-full max-w-md mx-auto shadow-xl ring-1 ring-slate-100 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pt-8 pb-6">
              <div className="flex flex-col items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-900">Welcome Back</h2>
                  <p className="text-sm text-gray-600 mt-1">Sign in to continue to Academic Query Hub</p>
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
                  placeholder="Enter your password"
                  required
                />

                <Button type="submit" className="w-full" loading={loading}>
                  Sign In
                </Button>

                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={onSwitchToRegister}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Register here
                    </button>
                  </p>
                </div>
              </form>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
