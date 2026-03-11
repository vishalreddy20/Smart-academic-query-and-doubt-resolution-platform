import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyDoubts } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Plus, Loader } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('posted');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchDoubts();
  }, [page]);

  const fetchDoubts = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await getMyDoubts(page);
      setDoubts(data.doubts || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load doubts');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-amber-100 text-amber-800';
      case 'claimed':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return '📋';
      case 'claimed':
        return '👤';
      case 'resolved':
        return '✓';
      default:
        return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name}! 👋</h1>
          <p className="text-indigo-100">Student Dashboard - Manage your doubts and learn from solutions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Posted', value: doubts.length, icon: '📝', color: 'from-blue-500 to-blue-600' },
            { label: 'Open', value: doubts.filter(d => d.status === 'open').length, icon: '❓', color: 'from-amber-500 to-amber-600' },
            { label: 'Claimed', value: doubts.filter(d => d.status === 'claimed').length, icon: '👤', color: 'from-indigo-500 to-indigo-600' },
            { label: 'Solved', value: doubts.filter(d => d.status === 'resolved').length, icon: '✅', color: 'from-green-500 to-green-600' },
          ].map((stat, idx) => (
            <div key={idx} className={`bg-gradient-to-br ${stat.color} text-white p-6 rounded-lg shadow-md`}>
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-sm opacity-90">{stat.label}</div>
              <div className="text-3xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/post-doubt')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            Post New Doubt
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-slate-200 flex">
            <button
              onClick={() => setActiveTab('posted')}
              className={`flex-1 px-6 py-4 font-medium transition ${
                activeTab === 'posted'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Doubts ({doubts.filter(d => d.status !== 'resolved').length})
            </button>
            <button
              onClick={() => setActiveTab('solved')}
              className={`flex-1 px-6 py-4 font-medium transition ${
                activeTab === 'solved'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Solved ({doubts.filter(d => d.status === 'resolved').length})
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                {error}
              </div>
            ) : (
              <>
                {doubts.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 text-lg">No doubts posted yet</p>
                    <p className="text-slate-500 text-sm mt-2">Post your first doubt to get help from tutors</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(activeTab === 'posted'
                      ? doubts.filter(d => d.status !== 'resolved')
                      : doubts.filter(d => d.status === 'resolved')
                    ).map((doubt) => (
                      <div
                        key={doubt._id}
                        className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                        onClick={() => navigate(`/doubt/${doubt._id}`)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-slate-900 flex-1">{doubt.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${getStatusColor(doubt.status)}`}>
                            {getStatusIcon(doubt.status)} {doubt.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm mb-3 line-clamp-2">{doubt.description}</p>
                        <div className="flex justify-between items-center text-xs text-slate-500">
                          <span>📚 Subject: {doubt.subjectId?.name || 'General'}</span>
                          <span>Created {new Date(doubt.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
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
