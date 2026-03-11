import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOpenDoubts, claimDoubt } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Award, Plus, Loader, AlertCircle } from 'lucide-react';

export default function TutorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openDoubts, setOpenDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('open');
  const [claimedDoubts, setClaimedDoubts] = useState([]);

  useEffect(() => {
    fetchOpenDoubts();
  }, []);

  const fetchOpenDoubts = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await getOpenDoubts();
      setOpenDoubts(data.doubts || []);
      // In a real app, fetch claimed doubts separately
      setClaimedDoubts(data.claimedDoubts || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load doubts');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimDoubt = async (doubtId) => {
    try {
      await claimDoubt(doubtId);
      await fetchOpenDoubts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to claim doubt');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name}! 👋</h1>
          <p className="text-emerald-100">Tutor Dashboard - Claim doubts and help students</p>

          {!user?.isApproved && (
            <div className="mt-4 p-4 bg-amber-600 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Your profile is pending admin approval. You can view and claim doubts, but cannot submit solutions until approved.</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Open Doubts', value: openDoubts.length, icon: '❓', color: 'from-blue-500 to-blue-600' },
            { label: 'Claimed', value: claimedDoubts.length, icon: '📌', color: 'from-indigo-500 to-indigo-600' },
            { label: 'Completed', value: claimedDoubts.filter(d => d.status === 'resolved').length, icon: '✅', color: 'from-green-500 to-green-600' },
            { label: 'Total Earnings', value: `₹${user?.totalEarnings || 0}`, icon: '💰', color: 'from-emerald-500 to-emerald-600' },
          ].map((stat, idx) => (
            <div key={idx} className={`bg-gradient-to-br ${stat.color} text-white p-6 rounded-lg shadow-md`}>
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-sm opacity-90">{stat.label}</div>
              <div className="text-3xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tutor Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-600 mb-1">Rating</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-amber-500">{user?.rating || 0}</span>
                <span className="text-amber-500">★</span>
                <span className="text-sm text-slate-600">/ 5.0</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Solved</p>
              <div className="text-3xl font-bold text-emerald-600">{user?.totalSolved || 0}</div>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Approval Status</p>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${user?.isApproved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                {user?.isApproved ? '✓ Approved' : '⏳ Pending'}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-slate-200 flex">
            <button
              onClick={() => setActiveTab('open')}
              className={`flex-1 px-6 py-4 font-medium transition ${
                activeTab === 'open'
                  ? 'border-b-2 border-emerald-600 text-emerald-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Open Doubts ({openDoubts.length})
            </button>
            <button
              onClick={() => setActiveTab('claimed')}
              className={`flex-1 px-6 py-4 font-medium transition ${
                activeTab === 'claimed'
                  ? 'border-b-2 border-emerald-600 text-emerald-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Claimed ({claimedDoubts.length})
            </button>
            <button
              onClick={() => setActiveTab('earnings')}
              className={`flex-1 px-6 py-4 font-medium transition ${
                activeTab === 'earnings'
                  ? 'border-b-2 border-emerald-600 text-emerald-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Earnings
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                {error}
              </div>
            ) : (
              <>
                {activeTab === 'open' && (
                  <>
                    {openDoubts.length === 0 ? (
                      <div className="text-center py-12">
                        <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600 text-lg">No open doubts available</p>
                        <p className="text-slate-500 text-sm mt-2">Check back soon for new doubts to claim!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {openDoubts.map((doubt) => (
                          <div
                            key={doubt._id}
                            className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-slate-900 flex-1">{doubt.title}</h3>
                              {doubt.difficulty && (
                                <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${getDifficultyColor(doubt.difficulty)}`}>
                                  {doubt.difficulty.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600 text-sm mb-3 line-clamp-2">{doubt.description}</p>
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex gap-4 text-xs text-slate-500">
                                <span>📚 {doubt.subjectId?.name || 'General'}</span>
                                <span>👤 {doubt.studentId?.name || 'Anonymous'}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleClaimDoubt(doubt._id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                            >
                              Claim This Doubt
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'claimed' && (
                  <>
                    {claimedDoubts.length === 0 ? (
                      <div className="text-center py-12 text-slate-600">
                        <p>You haven't claimed any doubts yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {claimedDoubts.map((doubt) => (
                          <div
                            key={doubt._id}
                            className="border border-slate-200 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-bold text-slate-900">{doubt.title}</h3>
                                <p className="text-slate-600 text-sm mt-1">Claimed on {new Date(doubt.claimedAt).toLocaleDateString()}</p>
                              </div>
                              {doubt.status === 'resolved' ? (
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">✓ Solved</span>
                              ) : (
                                <button
                                  onClick={() => navigate(`/submit-solution/${doubt._id}`)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                                >
                                  Submit Solution
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'earnings' && (
                  <div className="space-y-4">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                      <div className="text-center">
                        <p className="text-sm text-emerald-700 mb-2">Current Month Earnings</p>
                        <p className="text-4xl font-bold text-emerald-600">₹{user?.totalEarnings || 0}</p>
                        <p className="text-sm text-emerald-600 mt-2">From {user?.totalSolved || 0} solved doubts</p>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm">
                      Earnings are calculated based on the number of doubts you solve and the difficulty level.
                      Payments are processed monthly.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
