import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOpenDoubts, getClaimedDoubts, claimDoubt, getResolvedDoubts } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Award, Loader, AlertCircle, ChevronRight, Clock, Star, BookOpen,
  User, DollarSign, TrendingUp, Eye, CheckCircle, Sparkles, Zap,
  Target, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_BADGE = {
  claimed:       'bg-blue-100 text-blue-700 border-blue-200',
  'in-progress': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  submitted:     'bg-purple-100 text-purple-700 border-purple-200',
  resolved:      'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const DIFF_BADGE = {
  easy:   'bg-emerald-50 text-emerald-600 border-emerald-200',
  medium: 'bg-amber-50 text-amber-600 border-amber-200',
  hard:   'bg-rose-50 text-rose-600 border-rose-200',
};

export default function TutorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [openDoubts, setOpenDoubts] = useState([]);
  const [claimedDoubts, setClaimedDoubts] = useState([]);
  const [resolvedDoubts, setResolvedDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('open');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError('');
      const [openRes, claimedRes, resolvedRes] = await Promise.allSettled([
        getOpenDoubts(),
        getClaimedDoubts(),
        getResolvedDoubts(),
      ]);
      if (openRes.status === 'fulfilled') setOpenDoubts(openRes.value.data.doubts || []);
      if (claimedRes.status === 'fulfilled') setClaimedDoubts(claimedRes.value.data.doubts || []);
      if (resolvedRes.status === 'fulfilled') setResolvedDoubts(resolvedRes.value.data.doubts || []);
    } catch (err) {
      setError('Failed to load doubts');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (doubtId, e) => {
    e.stopPropagation();
    try {
      setClaiming(doubtId);
      setError('');
      await claimDoubt(doubtId);
      setSuccessMsg('✅ Doubt claimed successfully! Navigate to it to submit your answer.');
      setTimeout(() => setSuccessMsg(''), 4000);
      await fetchAll();
      setActiveTab('claimed');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to claim doubt');
    } finally {
      setClaiming(null);
    }
  };

  const activeClaimedDoubts = claimedDoubts.filter(d => ['claimed', 'in-progress'].includes(d.status));
  const submittedDoubts = claimedDoubts.filter(d => d.status === 'submitted');

  const stats = [
    { label: 'Available', value: openDoubts.length, icon: Target, gradient: 'from-sky-500 to-blue-600', shadow: 'shadow-blue-200' },
    { label: 'In Progress', value: activeClaimedDoubts.length, icon: Zap, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-purple-200' },
    { label: 'Awaiting Rating', value: submittedDoubts.length, icon: Star, gradient: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-200' },
    { label: 'Resolved', value: resolvedDoubts.length, icon: CheckCircle, gradient: 'from-emerald-400 to-green-600', shadow: 'shadow-emerald-200' },
  ];

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700" />
        <div className="absolute inset-0">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute right-40 top-10 w-40 h-40 bg-white/5 rounded-full blur-xl" />
          <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-wrap gap-4 items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span className="text-emerald-200 text-xs font-semibold tracking-wider uppercase">Tutor Dashboard</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">
                Welcome, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-emerald-100/80 text-sm">Help students solve their academic doubts and earn rewards</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchAll}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl text-sm font-medium text-white transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold backdrop-blur-sm ${
                user?.isApproved
                  ? 'bg-emerald-400/20 text-emerald-100 border border-emerald-300/30'
                  : 'bg-amber-400/20 text-amber-100 border border-amber-300/30'
              }`}>
                {user?.isApproved ? (
                  <><CheckCircle className="w-4 h-4" /> Approved Tutor</>
                ) : (
                  <><Clock className="w-4 h-4" /> Pending Approval</>
                )}
              </div>
            </div>
          </div>

          {!user?.isApproved && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 p-4 bg-amber-500/15 backdrop-blur-sm border border-amber-400/30 rounded-2xl flex items-center gap-3 text-amber-100 text-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-300" />
              <span>Your account is pending admin approval. You can browse doubts but cannot claim until approved.</span>
            </motion.div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 -mt-4">
        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3 shadow-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">✕</button>
            </motion.div>
          )}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl flex items-center gap-3 shadow-sm"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{successMsg}</span>
              <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-600">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                key={i}
                className={`bg-gradient-to-br ${s.gradient} text-white p-5 rounded-2xl shadow-lg ${s.shadow} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-3xl font-black">{s.value}</span>
                </div>
                <p className="text-white/80 text-xs font-semibold tracking-wide uppercase">{s.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Performance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6 hover:shadow-md transition"
        >
          <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Your Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100/50">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-md shadow-amber-200">
                <Star className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900">{user?.rating?.toFixed(1) || '—'}</p>
                <p className="text-sm text-slate-500 font-medium">Average Rating</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/50">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-200">
                <Award className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900">{user?.totalSolved || user?.totalDoubtsResolved || 0}</p>
                <p className="text-sm text-slate-500 font-medium">Total Solved</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-md shadow-blue-200">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900">₹{user?.totalEarnings || 0}</p>
                <p className="text-sm text-slate-500 font-medium">Total Earnings</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 overflow-hidden">
          <div className="border-b border-slate-100 flex overflow-x-auto scrollbar-hide">
            {[
              { id: 'open', label: 'Open Doubts', count: openDoubts.length, icon: Target },
              { id: 'claimed', label: 'My Active', count: activeClaimedDoubts.length, icon: Zap },
              { id: 'submitted', label: 'Awaiting Rating', count: submittedDoubts.length, icon: Star },
              { id: 'resolved', label: 'Resolved', count: resolvedDoubts.length, icon: CheckCircle },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 font-semibold text-sm whitespace-nowrap border-b-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.id ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-5 sm:p-6">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
                  <p className="text-slate-400 text-sm">Loading doubts...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Open Doubts */}
                {activeTab === 'open' && (
                  openDoubts.length === 0 ? (
                    <EmptyState icon={Target} title="No open doubts available" subtitle="Check back later for new doubts to solve!" />
                  ) : (
                    <div className="space-y-3">
                      {openDoubts.map((doubt, i) => (
                        <motion.div
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.04 }}
                          key={doubt._id}
                          className="group border border-slate-200 hover:border-emerald-300 rounded-2xl p-5 hover:shadow-lg hover:shadow-emerald-50 transition-all duration-300 cursor-pointer bg-white"
                          onClick={() => navigate(`/doubt/${doubt._id}`)}
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h3 className="font-bold text-slate-900 flex-1 group-hover:text-emerald-700 transition text-base leading-snug">
                              {doubt.title}
                            </h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {doubt.difficulty && (
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${DIFF_BADGE[doubt.difficulty]}`}>
                                  {doubt.difficulty}
                                </span>
                              )}
                              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </div>
                          <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">{doubt.description}</p>
                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                              <span className="flex items-center gap-1.5 text-slate-500">
                                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                                {doubt.subjectId?.name || 'General'}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" />
                                {doubt.studentId?.name}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {timeAgo(doubt.createdAt)}
                              </span>
                            </div>
                            <button
                              onClick={(e) => handleClaim(doubt._id, e)}
                              disabled={!user?.isApproved || claiming === doubt._id}
                              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-emerald-100"
                            >
                              {claiming === doubt._id ? (
                                <><Loader className="w-3.5 h-3.5 animate-spin" /> Claiming...</>
                              ) : (
                                <><Zap className="w-3.5 h-3.5" /> Claim Doubt</>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )
                )}

                {/* Active (claimed / in-progress) */}
                {activeTab === 'claimed' && (
                  activeClaimedDoubts.length === 0 ? (
                    <EmptyState icon={Zap} title="No doubts in progress" subtitle="Claim doubts from the Open tab to get started!" />
                  ) : (
                    <div className="space-y-3">
                      {activeClaimedDoubts.map((doubt, i) => (
                        <motion.div
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.04 }}
                          key={doubt._id}
                          className="group border border-slate-200 hover:border-violet-300 rounded-2xl p-5 hover:shadow-lg hover:shadow-violet-50 transition-all duration-300 cursor-pointer bg-white"
                          onClick={() => navigate(`/doubt/${doubt._id}`)}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <h3 className="font-bold text-slate-900 group-hover:text-violet-700 transition text-base leading-snug mb-1.5">{doubt.title}</h3>
                              <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{doubt.description}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${STATUS_BADGE[doubt.status]}`}>
                                {doubt.status === 'claimed' ? '📌 Claimed' : '⚙️ In Progress'}
                              </span>
                              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-indigo-400" /> {doubt.subjectId?.name}</span>
                            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {doubt.studentId?.name}</span>
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Claimed {timeAgo(doubt.claimedAt || doubt.createdAt)}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )
                )}

                {/* Submitted — awaiting student rating */}
                {activeTab === 'submitted' && (
                  submittedDoubts.length === 0 ? (
                    <EmptyState icon={Star} title="No doubts awaiting rating" subtitle="Answers you submit will appear here until the student rates them." />
                  ) : (
                    <div className="space-y-3">
                      {submittedDoubts.map((doubt, i) => (
                        <motion.div
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.04 }}
                          key={doubt._id}
                          className="group border border-amber-200 bg-gradient-to-r from-amber-50/50 to-orange-50/30 rounded-2xl p-5 cursor-pointer hover:shadow-lg hover:shadow-amber-50 transition-all duration-300"
                          onClick={() => navigate(`/doubt/${doubt._id}`)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-slate-900 mb-1.5 group-hover:text-amber-700 transition text-base">{doubt.title}</h3>
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-indigo-400" /> {doubt.subjectId?.name}</span>
                                <span className="text-amber-600 font-semibold flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 text-amber-400" /> Waiting for student rating...
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">📨 Submitted</span>
                              <ChevronRight className="w-4 h-4 text-slate-300" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )
                )}

                {/* Resolved */}
                {activeTab === 'resolved' && (
                  resolvedDoubts.length === 0 ? (
                    <EmptyState icon={Award} title="No resolved doubts yet" subtitle="Complete and get rated on doubts to see them here!" />
                  ) : (
                    <div className="space-y-3">
                      {resolvedDoubts.map((doubt, i) => (
                        <motion.div
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.04 }}
                          key={doubt._id}
                          className="group border border-emerald-200 bg-gradient-to-r from-emerald-50/50 to-teal-50/30 rounded-2xl p-5 cursor-pointer hover:shadow-lg hover:shadow-emerald-50 transition-all duration-300"
                          onClick={() => navigate(`/doubt/${doubt._id}`)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-slate-900 mb-1.5 group-hover:text-emerald-700 transition text-base">{doubt.title}</h3>
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-indigo-400" /> {doubt.subjectId?.name}</span>
                                {doubt.studentRating && (
                                  <span className="flex items-center gap-1 text-amber-600 font-semibold">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    {doubt.studentRating}/5
                                  </span>
                                )}
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {timeAgo(doubt.resolvedAt || doubt.updatedAt || doubt.createdAt)}</span>
                              </div>
                            </div>
                            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex-shrink-0">✅ Resolved</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
        <Icon className="w-10 h-10 text-slate-200" />
      </div>
      <p className="text-slate-600 font-semibold text-lg">{title}</p>
      <p className="text-slate-400 text-sm mt-1.5 max-w-md mx-auto">{subtitle}</p>
    </div>
  );
}
