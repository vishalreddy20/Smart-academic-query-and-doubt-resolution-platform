import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginUser } from '../services/api';
import OTPModal from '../components/OTPModal';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { data } = await loginUser({ email, password });

      login({
        _id: data.user._id,
        id: data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        token: data.token,
        isApproved: data.user.isApproved,
        isPremiumActive: data.user.isPremiumActive,
        profilePic: data.user.profilePic,
        rating: data.user.rating,
        totalSolved: data.user.totalSolved || data.user.totalDoubtsResolved || 0,
        totalEarnings: data.user.totalEarnings || 0,
      });

      if (data.user.role === 'student') navigate('/student');
      else if (data.user.role === 'tutor') navigate('/tutor');
      else if (data.user.role === 'admin') navigate('/admin');
    } catch (err) {
      if (err.response?.data?.requiresOTPVerification) {
        setOtpEmail(err.response.data.email || email);
        setError('');
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSuccess = (verifyData) => {
    if (verifyData && verifyData.token && verifyData.user) {
      login({
        ...verifyData.user,
        _id: verifyData.user._id,
        id: verifyData.user._id,
        token: verifyData.token,
      });

      if (verifyData.user.role === 'student') navigate('/dashboard');
      else if (verifyData.user.role === 'tutor' || verifyData.user.role === 'faculty') navigate('/faculty-dashboard');
      else if (verifyData.user.role === 'admin') navigate('/admin-dashboard');
      else navigate('/');
    } else {
      setOtpEmail('');
      setError('Email verified. Please sign in.');
    }
  };

  if (otpEmail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <OTPModal email={otpEmail} onSuccess={handleOTPSuccess} />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col md:flex-row bg-background">
      {/* Left Section: Branding (Hidden on Mobile) */}
      <section className="hidden md:flex md:w-1/2 editorial-gradient relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-secondary blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-container blur-[100px]"></div>
        </div>
        <div className="relative z-10 max-w-lg text-center md:text-left">
          <div className="mb-10 inline-flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <span className="material-symbols-outlined text-secondary-fixed">history_edu</span>
            <span className="text-white text-xs font-label uppercase tracking-widest">Tutorify</span>
          </div>
          <h1 className="font-headline text-white text-5xl md:text-6xl leading-tight mb-6">
            Where Intelligence Meets <i>Clarity</i>.
          </h1>
          <p className="text-on-primary-container text-lg md:text-xl font-light mb-12 leading-relaxed">
            Access the curated knowledge base for verified faculty and research scholars.
          </p>
        </div>
      </section>

      {/* Right Section: Login Form */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-surface">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="md:hidden flex flex-col items-center mb-10 text-center">
            <span className="material-symbols-outlined text-primary text-4xl mb-2">history_edu</span>
            <h2 className="font-headline text-3xl font-bold text-on-surface">Tutorify</h2>
          </div>

          <header className="mb-10">
            <h2 className="font-headline text-3xl font-medium text-on-surface mb-2">Welcome Back</h2>
            <p className="text-on-surface-variant font-light">Enter your credentials to access the platform.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-error-container rounded-lg">
                <p className="text-error text-sm">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                Institutional Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest transition-all outline-none disabled:opacity-50"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-label text-secondary hover:text-on-secondary-container transition-colors uppercase tracking-tight">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest transition-all outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label className="flex items-center space-x-2 text-on-surface-variant text-sm cursor-pointer">
              <input type="checkbox" className="rounded border-outline-variant" />
              <span>Remember for 7 days</span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Sign Up Link */}
            <div className="pt-8 border-t border-outline-variant/20 text-center">
              <p className="text-on-surface-variant text-sm">
                New to Tutorify?{' '}
                <Link to="/register" className="text-secondary hover:text-on-secondary-container font-semibold transition-colors">
                  Create account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
