import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile, changePassword, getSubscription } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  User, Lock, Mail, Phone, GraduationCap, Building, Calendar,
  Save, CheckCircle, AlertCircle, Loader, ArrowLeft, Shield,
  Star, Award, BookOpen, Crown
} from 'lucide-react';
import { motion } from 'framer-motion';

const INPUT = 'w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white transition';
const LABEL = 'block text-sm font-semibold text-slate-700 mb-1.5';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form
  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    college: user?.college || '',
    branch: user?.branch || '',
    graduationYear: user?.graduationYear || '',
    expertise: user?.expertise ? user.expertise.join(', ') : '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Password form
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        phone: user.phone || '',
        college: user.college || '',
        branch: user.branch || '',
        graduationYear: user.graduationYear || '',
        expertise: user.expertise ? user.expertise.join(', ') : '',
      });
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const { data } = await getSubscription();
      setSubscription(data.subscription || null);
    } catch (_) {}
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ type: '', text: '' });
    try {
      const payload = {
        name: profile.name,
        phone: profile.phone,
        college: profile.college,
        branch: profile.branch,
        graduationYear: profile.graduationYear ? Number(profile.graduationYear) : undefined,
        expertise: profile.expertise ? profile.expertise.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      const { data } = await updateProfile(payload);
      updateUser({ ...user, ...payload, name: payload.name });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSavingProfile(false);
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 4000);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPwdMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setSavingPwd(true);
    setPwdMsg({ type: '', text: '' });
    try {
      await changePassword({ currentPassword: passwords.oldPassword, newPassword: passwords.newPassword, confirmPassword: passwords.newPassword });
      setPwdMsg({ type: 'success', text: 'Password changed successfully!' });
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setSavingPwd(false);
      setTimeout(() => setPwdMsg({ type: '', text: '' }), 4000);
    }
  };

  const getDashboardPath = () => {
    if (user?.role === 'student') return '/student';
    if (user?.role === 'tutor') return '/tutor';
    if (user?.role === 'admin') return '/admin';
    return '/';
  };

  const roleColor = {
    student: 'from-blue-600 to-indigo-600',
    tutor: 'from-emerald-600 to-teal-600',
    admin: 'from-purple-600 to-indigo-600',
  };

  const planBadge = {
    free: { label: 'Free Plan', color: 'bg-slate-100 text-slate-600' },
    premium: { label: 'Premium', color: 'bg-indigo-100 text-indigo-700' },
    pro: { label: 'Pro', color: 'bg-amber-100 text-amber-700' },
  };

  const plan = planBadge[subscription?.planType || 'free'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Hero Header */}
      <div className={`bg-gradient-to-r ${roleColor[user?.role] || 'from-indigo-600 to-blue-600'} text-white`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate(getDashboardPath())}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl shadow-lg flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold mb-1">{user?.name}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="capitalize bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {user?.role}
                </span>
                <span className="text-white/80 text-sm flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {user?.email}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${plan.color}`}>
                  {plan.label}
                </span>
              </div>
            </div>
            {user?.role === 'tutor' && (
              <div className="ml-auto flex gap-4 text-center">
                <div className="bg-white/10 rounded-xl px-4 py-3">
                  <p className="text-2xl font-bold">{user?.rating?.toFixed(1) || '—'}</p>
                  <p className="text-white/70 text-xs">Rating</p>
                </div>
                <div className="bg-white/10 rounded-xl px-4 py-3">
                  <p className="text-2xl font-bold">{user?.totalSolved || 0}</p>
                  <p className="text-white/70 text-xs">Solved</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 mb-8">
          {[
            { id: 'profile', label: 'Personal Info', icon: User },
            { id: 'security', label: 'Security', icon: Shield },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3 font-medium text-sm border-b-2 transition ${
                activeTab === id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-900 text-lg">Personal Information</h2>
                  <p className="text-sm text-slate-500">Update your profile details</p>
                </div>
                <div className="px-6 py-5 space-y-4">
                  {profileMsg.text && (
                    <div className={`p-3 rounded-xl flex items-center gap-2 text-sm ${
                      profileMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {profileMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {profileMsg.text}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className={INPUT + ' pl-10'}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className={LABEL}>Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className={INPUT + ' pl-10'}
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={LABEL}>College / Institution</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={profile.college}
                        onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                        className={INPUT + ' pl-10'}
                        placeholder="Your college or university"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Branch / Stream</label>
                      <div className="relative">
                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={profile.branch}
                          onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                          className={INPUT + ' pl-10'}
                          placeholder="e.g. Computer Science"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={LABEL}>Graduation Year</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="number"
                          value={profile.graduationYear}
                          onChange={(e) => setProfile({ ...profile, graduationYear: e.target.value })}
                          className={INPUT + ' pl-10'}
                          placeholder="YYYY"
                          min="2000"
                          max="2035"
                        />
                      </div>
                    </div>
                  </div>

                  {user?.role === 'tutor' && (
                    <div>
                      <label className={LABEL}>Expertise Areas</label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <textarea
                          value={profile.expertise}
                          onChange={(e) => setProfile({ ...profile, expertise: e.target.value })}
                          className={INPUT + ' pl-10 resize-none'}
                          placeholder="e.g. Mathematics, Physics, Data Structures (comma separated)"
                          rows={2}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Separate subjects with commas</p>
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition disabled:opacity-60"
                  >
                    {savingProfile ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Right column — stats */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-500" />
                  Account Info
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">Role</span>
                    <span className="font-medium capitalize text-slate-900">{user?.role}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">Email Verified</span>
                    <span className={user?.isVerified ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                      {user?.isVerified ? '✓ Verified' : '✗ Not verified'}
                    </span>
                  </div>
                  {user?.role === 'tutor' && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-500">Approval</span>
                      <span className={user?.isApproved ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                        {user?.isApproved ? '✓ Approved' : '⏳ Pending'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-500">Subscription</span>
                    <span className="font-medium text-indigo-600 capitalize">{subscription?.planType || 'Free'}</span>
                  </div>
                </div>
              </div>

              {user?.role === 'student' && (
                <div
                  onClick={() => navigate('/subscription')}
                  className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-5 rounded-2xl cursor-pointer hover:shadow-lg transition"
                >
                  <Crown className="w-8 h-8 mb-2 text-yellow-300" />
                  <p className="font-bold mb-1">Upgrade to Premium</p>
                  <p className="text-indigo-200 text-xs">Get 50 doubts/month + priority support</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="max-w-lg"
          >
            <form onSubmit={handleChangePassword} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-500" />
                  Change Password
                </h2>
                <p className="text-sm text-slate-500">Update your account password</p>
              </div>
              <div className="px-6 py-5 space-y-4">
                {pwdMsg.text && (
                  <div className={`p-3 rounded-xl flex items-center gap-2 text-sm ${
                    pwdMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {pwdMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {pwdMsg.text}
                  </div>
                )}
                {[
                  { key: 'oldPassword', label: 'Current Password', placeholder: 'Enter current password' },
                  { key: 'newPassword', label: 'New Password', placeholder: 'At least 6 characters' },
                  { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Re-enter new password' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className={LABEL}>{label}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        value={passwords[key]}
                        onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                        className={INPUT + ' pl-10'}
                        placeholder={placeholder}
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={savingPwd}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition disabled:opacity-60"
                >
                  {savingPwd ? <Loader className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  {savingPwd ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
