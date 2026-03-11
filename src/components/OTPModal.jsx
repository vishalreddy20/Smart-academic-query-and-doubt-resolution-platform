import { useState, useEffect } from 'react';
import { verifyOTP, resendOTP } from '../services/api';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function OTPModal({ email, devOtp: initialDevOtp = '', onSuccess }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [devOtp, setDevOtp] = useState(initialDevOtp);

  useEffect(() => {
    setDevOtp(initialDevOtp);
  }, [initialDevOtp]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await verifyOTP({
        email,
        otp: otpValue,
      });

      setResendSuccess('Email verified successfully! Redirecting...');
      setTimeout(onSuccess, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendLoading(true);
      setError('');
      setResendSuccess('');

      const { data } = await resendOTP({ email });

      setDevOtp(data.devOtp || '');
      setResendSuccess(data.devOtp ? 'OTP regenerated. Use the development code shown below.' : 'OTP sent to your email!');
      setTimeLeft(300);
      setOtp(['', '', '', '', '', '']);

      setTimeout(() => setResendSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isExpired = timeLeft === 0;

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
      <div className="flex justify-center mb-6">
        <div className="bg-indigo-600 p-3 rounded-full">
          <Clock className="w-8 h-8 text-white" />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">
        Verify Email
      </h1>
      <p className="text-center text-slate-600 mb-8">
        We've sent a 6-digit OTP to<br />
        <span className="font-medium">{email}</span>
      </p>

      {devOtp && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg">
          <p className="text-sm font-medium mb-1">Development email fallback is active.</p>
          <p className="text-sm">SMTP is not configured, so use this OTP:</p>
          <p className="mt-2 text-2xl font-bold tracking-[0.35em] text-center">{devOtp}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {resendSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{resendSuccess}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-4">
            Enter OTP
          </label>

          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={loading || isExpired}
                className="w-12 h-12 text-center text-2xl font-bold border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="submit"
            disabled={loading || isExpired}
            className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>

          {!isExpired && (
            <p className="text-center text-slate-600 text-sm">
              OTP expires in <span className="font-bold text-indigo-600">{formatTime(timeLeft)}</span>
            </p>
          )}

          {isExpired && (
            <p className="text-center text-red-600 text-sm font-medium">
              OTP expired. Please request a new one.
            </p>
          )}
        </div>
      </form>

      <div className="text-center mt-6 pt-6 border-t border-slate-200">
        <p className="text-slate-600 text-sm mb-3">
          Didn't receive the code?
        </p>
        <button
          onClick={handleResend}
          disabled={resendLoading || loading}
          className="text-indigo-600 hover:text-indigo-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {resendLoading ? 'Sending...' : 'Resend OTP'}
        </button>
      </div>
    </div>
  );
}
