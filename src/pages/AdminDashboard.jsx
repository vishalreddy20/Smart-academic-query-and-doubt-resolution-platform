import { useState, useEffect } from 'react';
import { getStats, getAllUsers, approveTutor, rejectTutor } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Settings, Users, TrendingUp, AlertCircle, Loader } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [filterRole, setFilterRole] = useState('all');
  const [approvalLoading, setApprovalLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [statsRes, usersRes] = await Promise.all([
        getStats(),
        getAllUsers(),
      ]);

      setStats(statsRes.data.stats || {});
      setUsers(usersRes.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTutor = async (userId) => {
    try {
      setApprovalLoading(true);
      await approveTutor(userId);
      fetchDashboardData();
    } catch (err) {
      setError(`Failed to approve tutor: ${err.response?.data?.message}`);
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleRejectTutor = async (userId) => {
    try {
      setApprovalLoading(true);
      await rejectTutor(userId, { reason: 'Not qualified' });
      fetchDashboardData();
    } catch (err) {
      setError(`Failed to reject tutor: ${err.response?.data?.message}`);
    } finally {
      setApprovalLoading(false);
    }
  };

  const pendingTutors = users.filter(u => u.role === 'tutor' && !u.isApproved);
  const filteredUsers = filterRole === 'all' 
    ? users 
    : users.filter(u => u.role === filterRole);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard 🔧</h1>
          <p className="text-purple-100">Welcome, {user?.name}! Manage the Tutorify platform</p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Users', value: stats.totalUsers || 0, icon: '👥', color: 'from-blue-500 to-blue-600' },
                { label: 'Total Tutors', value: stats.totalTutors || 0, icon: '👨‍🏫', color: 'from-green-500 to-green-600' },
                { label: 'Open Doubts', value: stats.openDoubts || 0, icon: '❓', color: 'from-amber-500 to-amber-600' },
                { label: 'Platform Revenue', value: `₹${stats.totalRevenue || 0}`, icon: '💰', color: 'from-emerald-500 to-emerald-600' },
              ].map((stat, idx) => (
                <div key={idx} className={`bg-gradient-to-br ${stat.color} text-white p-6 rounded-lg shadow-md`}>
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-sm opacity-90">{stat.label}</div>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Pending Approvals Alert */}
            {pendingTutors.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-900">Pending Tutor Approvals</p>
                  <p className="text-sm text-amber-700">{pendingTutors.length} tutor(s) waiting for approval</p>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b border-slate-200 flex flex-wrap">
                {['overview', 'users', 'pending-tutors', 'payments', 'subjects'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-medium transition ${
                      activeTab === tab
                        ? 'border-b-2 border-purple-600 text-purple-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab === 'overview' && 'Overview'}
                    {tab === 'users' && `Users (${users.length})`}
                    {tab === 'pending-tutors' && `Pending Tutors (${pendingTutors.length})`}
                    {tab === 'payments' && 'Payments'}
                    {tab === 'subjects' && 'Subjects'}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                      <h3 className="font-bold text-slate-900 mb-4">Platform Activity</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Total Doubts Posted</span>
                          <span className="font-bold text-blue-600">{stats.totalDoubts || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Doubts Resolved</span>
                          <span className="font-bold text-green-600">{stats.resolvedDoubts || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Total Payments</span>
                          <span className="font-bold text-emerald-600">₹{stats.totalPayments || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                      <h3 className="font-bold text-slate-900 mb-4">User Distribution</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Students</span>
                          <span className="font-bold text-indigo-600">{stats.studentCount || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Approved Tutors</span>
                          <span className="font-bold text-green-600">{stats.approvedTutors || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Pending Tutors</span>
                          <span className="font-bold text-amber-600">{stats.pendingTutors || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                  <div>
                    <div className="mb-4">
                      <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="all">All Users</option>
                        <option value="student">Students</option>
                        <option value="tutor">Tutors</option>
                        <option value="admin">Admins</option>
                      </select>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="px-4 py-2 text-left font-bold text-slate-700">Name</th>
                            <th className="px-4 py-2 text-left font-bold text-slate-700">Email</th>
                            <th className="px-4 py-2 text-left font-bold text-slate-700">Role</th>
                            <th className="px-4 py-2 text-left font-bold text-slate-700">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {filteredUsers.map((u) => (
                            <tr key={u._id} className="hover:bg-slate-50">
                              <td className="px-4 py-2">{u.name}</td>
                              <td className="px-4 py-2">{u.email}</td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  u.role === 'student' ? 'bg-blue-100 text-blue-800' :
                                  u.role === 'tutor' ? 'bg-green-100 text-green-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {u.role.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  u.isApproved ? 'bg-green-100 text-green-800' :
                                  u.accountVerified ? 'bg-blue-100 text-blue-800' :
                                  'bg-slate-100 text-slate-800'
                                }`}>
                                  {u.isApproved ? '✓ Approved' : u.accountVerified ? 'Verified' : 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Pending Tutors Tab */}
                {activeTab === 'pending-tutors' && (
                  <div className="space-y-4">
                    {pendingTutors.length === 0 ? (
                      <p className="text-center text-slate-600 py-8">✓ No pending tutor approvals</p>
                    ) : (
                      pendingTutors.map((tutor) => (
                        <div key={tutor._id} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-slate-900">{tutor.name}</h3>
                              <p className="text-sm text-slate-600">{tutor.email}</p>
                              <p className="text-sm text-slate-600 mt-1">
                                📚 {tutor.branch} | 🎓 {tutor.college}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveTutor(tutor._id)}
                                disabled={approvalLoading}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectTutor(tutor._id)}
                                disabled={approvalLoading}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Payments Tab */}
                {activeTab === 'payments' && (
                  <div className="text-center py-12 text-slate-600">
                    <p>Payment management coming soon</p>
                  </div>
                )}

                {/* Subjects Tab */}
                {activeTab === 'subjects' && (
                  <div className="text-center py-12 text-slate-600">
                    <p>Subject management coming soon</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
