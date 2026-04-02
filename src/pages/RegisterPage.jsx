import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import OTPModal from '../components/OTPModal';

export default function RegisterPage() {
  const [step, setStep] = useState('form'); // 'form', 'otp'
  const [role, setRole] = useState('student');
  const [devOtp, setDevOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Calculate password strength
    if (name === 'password') {
      let strength = 0;
      if (value.length >= 8) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[!@#$%^&*]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    return true;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { data } = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
      });

      setUserId(data.userId);
      setRegisteredEmail(data.email);
      setDevOtp(data.devOtp || '');
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSuccess = () => {
    navigate('/login');
  };

  return (
    <main className="flex min-h-screen flex-col md:flex-row bg-background">
      {/* Left Section: Branding (Hidden on Mobile) */}
      <section className="hidden md:flex md:w-1/2 bg-primary-container relative overflow-hidden items-center justify-center p-12">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-secondary-container opacity-20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-primary opacity-10 rounded-full blur-[100px]"></div>

        <div className="relative z-10 max-w-lg text-center md:text-left">
          <div className="mb-10 inline-flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <span className="material-symbols-outlined text-secondary-fixed">school</span>
            <span className="text-white text-xs font-label uppercase tracking-widest">Scholar Ink</span>
          </div>
          <h1 className="font-headline text-white text-5xl md:text-6xl leading-tight mb-6">
            Join Our <i>Academic Community</i>.
          </h1>
          <p className="text-on-primary-container text-lg md:text-xl font-light mb-8 leading-relaxed">
            Create your account to post doubts, share knowledge, and grow with experts.
          </p>
        </div>
      </section>

      {/* Right Section: Registration Form */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-surface">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="md:hidden flex flex-col items-center mb-10 text-center">
            <span className="material-symbols-outlined text-primary text-4xl mb-2">school</span>
            <h2 className="font-headline text-3xl font-bold text-on-surface">Scholar Ink</h2>
          </div>

          <header className="mb-10">
            <h2 className="font-headline text-3xl font-medium text-on-surface mb-2">Create Account</h2>
            <p className="text-on-surface-variant font-light">Join our academic community and start your journey.</p>
          </header>

          {step === 'form' && (
            <form onSubmit={handleSubmitForm} className="space-y-6">
              {error && (
                <div className="p-4 bg-error-container rounded-lg">
                  <p className="text-error text-sm">{error}</p>
                </div>
              )}

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`px-4 py-3 rounded-xl font-medium transition-all ${
                      role === 'student'
                        ? 'bg-secondary text-on-secondary'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg mr-1">person</span> Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('faculty')}
                    className={`px-4 py-3 rounded-xl font-medium transition-all ${
                      role === 'faculty'
                        ? 'bg-secondary text-on-secondary'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg mr-1">school</span> Faculty
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest transition-all outline-none disabled:opacity-50"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                  Institutional Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@university.edu"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest transition-all outline-none disabled:opacity-50"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
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
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 h-1 rounded-full transition-colors ${
                            i < passwordStrength ? 'bg-secondary' : 'bg-surface-container'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      {passwordStrength <= 1 && 'Weak password'}
                      {passwordStrength === 2 && 'Fair password'}
                      {passwordStrength === 3 && 'Good password'}
                      {passwordStrength === 4 && 'Strong password'}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest transition-all outline-none disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-center space-x-2 text-on-surface-variant text-sm cursor-pointer">
                <input type="checkbox" required className="rounded border-outline-variant" />
                <span>I agree to the <span className="text-secondary hover:underline">Terms of Service</span></span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              {/* Sign In Link */}
              <div className="pt-8 border-t border-outline-variant/20 text-center">
                <p className="text-on-surface-variant text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-secondary hover:text-on-secondary-container font-semibold transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          )}

          {step === 'otp' && (
            <OTPModal email={registeredEmail} devOtp={devOtp} onSuccess={handleOTPSuccess} />
          )}
        </div>
      </section>
    </main>
  );
}
