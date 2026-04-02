import { useState, useEffect } from 'react';
import {
  getStats, getAllUsers, getPendingTutors, approveTutor, rejectTutor,
  deactivateUser, reactivateUser, deleteUserAdmin, createSubject,
  getAllSubjects, deleteSubject, getRecentDoubtsData, getRecentPaymentsData,
} from '../services/api';
import { AlertCircle, CheckCircle } from 'lucide-react';
import SidebarNav from '../components/SidebarNav';
import TopNavBar from '../components/TopNavBar';

const MODERATION_ITEMS = [
  { subject: 'Advanced Thermodynamics', type: 'Content Doubt', flag: 'System Audit', desc: 'Potential inaccurate resolution' },
  { subject: 'Dr. Julian Vance', type: 'Onboarding', flag: 'External Referral', desc: 'New Faculty Application' },
  { subject: 'Ethics in AI Discussion', type: 'Violation', flag: 'User Report', desc: 'Community Guideline Violation' },
];

const ACTIVITY_FEED = [
  { title: 'New Faculty Onboarded', desc: 'Prof. Elena Rossi joined Mathematics.', time: '12 Minutes Ago', color: 'bg-secondary' },
  { title: 'Resolution Benchmark Met', desc: 'Physics department cleared 98% of pending doubts.', time: '1 Hour Ago', color: 'bg-amber-500' },
  { title: 'System Backup Complete', desc: 'Automated editorial index secured.', time: '3 Hours Ago', color: 'bg-on-surface-variant' },
];

const SUBJECT_DEMAND = [
  { name: 'Quantum Mechanics', percent: 88 },
  { name: 'Macroeconomics', percent: 64 },
  { name: 'Linguistics', percent: 42 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [pendingTutors, setPendingTutors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [recentDoubts, setRecentDoubts] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [newSubject, setNewSubject] = useState({ name: '', branch: '', description: '' });
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [rejectModal, setRejectModal] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsR, usersR, pendingR, subjectsR, doubtsR, paymentsR] = await Promise.allSettled([
        getStats(),
        getAllUsers(),
        getPendingTutors(),
        getAllSubjects(),
        getRecentDoubtsData(),
        getRecentPaymentsData(),
      ]);
      if (statsR.status === 'fulfilled') setStats(statsR.value.data.stats || {});
      if (usersR.status === 'fulfilled') setAllUsers(usersR.value.data.users || []);
      if (pendingR.status === 'fulfilled') setPendingTutors(pendingR.value.data.tutors || []);
      if (subjectsR.status === 'fulfilled') setSubjects(subjectsR.value.data.subjects || []);
      if (doubtsR.status === 'fulfilled') setRecentDoubts(doubtsR.value.data.doubts || []);
      if (paymentsR.status === 'fulfilled') setRecentPayments(paymentsR.value.data.payments || []);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  };

  const handleApprove = async (id) => {
    try {
      await approveTutor(id);
      showSuccess('Tutor approved!');
      fetchAll();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      await rejectTutor(rejectModal.userId, { reason: rejectModal.reason || 'Application not approved' });
      showSuccess('Tutor rejected');
      setRejectModal(null);
      fetchAll();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to reject');
    }
  };

  const handleToggleActive = async (u) => {
    try {
      if (u.isActive) await deactivateUser(u._id);
      else await reactivateUser(u._id);
      showSuccess(`User ${u.isActive ? 'deactivated' : 'reactivated'}`);
      fetchAll();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this user? This cannot be undone.')) return;
    try {
      await deleteUserAdmin(id);
      showSuccess('User deleted');
      fetchAll();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.name || !newSubject.branch) {
      showError('Name and branch are required');
      return;
    }
    try {
      await createSubject(newSubject);
      showSuccess('Subject created!');
      setNewSubject({ name: '', branch: '', description: '' });
      setShowSubjectForm(false);
      fetchAll();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create');
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try {
      await deleteSubject(id);
      showSuccess('Subject deleted');
      fetchAll();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const filteredUsers = allUsers
    .filter(u => filterRole === 'all' || u.role === filterRole)
    .filter(u => !userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()));

  if (loading && allUsers.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin">
          <span className="material-symbols-outlined text-4xl text-secondary">hourglass_empty</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Sidebar */}
      <SidebarNav />

      {/* Top Navigation */}
      <TopNavBar
        withSidebar
        activePath="/admin"
        navItems={[
          { label: 'Overview', path: '/admin' },
          { label: 'Knowledge Base', path: '/knowledge-base' },
          { label: 'Profile', path: '/profile' },
        ]}
      />

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6 md:px-10 max-w-[1440px] mx-auto md:ml-72 min-h-screen">
        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-4 bg-error-container border border-error text-on-error-container rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-8 p-4 bg-secondary-container border border-secondary text-on-secondary-container rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* Hero Header */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl font-headline font-bold text-primary mb-2">Editorial Authority</h1>
              <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
                Orchestrating the flow of academic discourse. Monitor platform health, curate doubt resolution pathways, and manage the elite faculty network.
              </p>
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-2.5 rounded-lg bg-surface-container-high text-on-surface text-sm font-medium hover:translate-y-[-1px] transition-transform">
                Download Report
              </button>
              <button className="px-6 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-medium hover:scale-[1.02] shadow-sm transition-all">
                System Status: Optimal
              </button>
            </div>
          </div>
        </section>

        {/* KPI Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border-l-4 border-secondary">
            <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Total Users</span>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-headline font-bold text-primary">{stats.totalUsers || 0}</span>
              <span className="text-secondary text-sm font-medium">+12%</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Active Faculty</span>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-headline font-bold text-primary">{stats.approvedTutors || 0}</span>
              <span className="text-on-surface-variant text-sm font-medium">Global</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border-l-4 border-on-secondary-container">
            <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Doubts Resolved</span>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-headline font-bold text-primary">{stats.resolvedDoubts || 0}</span>
              <span className="text-secondary text-sm font-medium">+{Math.floor((stats.resolvedDoubts || 0) * 0.1)}</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Satisfaction</span>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-headline font-bold text-primary">4.9</span>
              <span className="material-symbols-outlined text-amber-500" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
            </div>
          </div>
        </section>

        {/* Analytics & Management */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content - Left (8 cols) */}
          <section className="lg:col-span-8 space-y-8">
            {/* Query Volume Chart */}
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-serif text-2xl font-bold text-primary">Query Volume & Resolution Trends</h3>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-surface-container-low text-xs font-medium text-on-surface-variant">Weekly</span>
                  <span className="px-3 py-1 rounded-full bg-secondary-container text-xs font-medium text-secondary">Monthly</span>
                </div>
              </div>
              <div className="h-64 flex items-end justify-between gap-2 px-2">
                {[40, 55, 45, 80, 65, 50, 75, 95, 60, 40].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-lg transition-all hover:${i === 3 || i === 7 ? 'bg-primary' : 'bg-secondary/20'}`}
                    style={{
                      height: `${h}%`,
                      backgroundColor: i === 3 || i === 7 ? '#006a61' : '#f2f4f6',
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-4 px-2 text-xs text-on-surface-variant font-medium uppercase tracking-widest">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span>
              </div>
            </div>

            {/* Moderation Queue */}
            <div className="bg-surface-container-lowest overflow-hidden rounded-xl shadow-sm">
              <div className="p-8 border-b border-surface-variant flex justify-between items-center">
                <h3 className="font-serif text-2xl font-bold text-primary">Moderation Queue</h3>
                <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full text-xs font-bold">12 Pending Actions</span>
              </div>
              <table className="w-full text-left">
                <thead className="bg-surface-container-low text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  <tr>
                    <th className="px-8 py-4">Subject</th>
                    <th className="px-8 py-4">Type</th>
                    <th className="px-8 py-4">Flagged By</th>
                    <th className="px-8 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant">
                  {MODERATION_ITEMS.map((item, i) => (
                    <tr key={i} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="px-8 py-5">
                        <div className="font-medium text-primary">{item.subject}</div>
                        <div className="text-xs text-on-surface-variant">{item.desc}</div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`${
                          item.type === 'Violation' ? 'bg-error-container text-on-error-container' :
                          item.type === 'Onboarding' ? 'bg-primary-container text-primary-fixed-dim' :
                          'bg-secondary-container text-on-secondary-container'
                        } px-2.5 py-1 rounded text-xs font-bold`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm text-on-surface-variant">{item.flag}</td>
                      <td className="px-8 py-5">
                        <button className="text-secondary font-semibold text-sm hover:underline">Review</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Sidebar - Right (4 cols) */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Quick Authority Actions */}
            <div className="bg-primary-container text-on-primary rounded-xl p-8 shadow-lg">
              <h3 className="font-serif text-xl font-bold mb-6 text-white">Quick Authority Actions</h3>
              <div className="grid grid-cols-1 gap-4">
                <button className="flex items-center gap-4 p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-left">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '24px', color: '#6bd8cb' }}>
                    campaign
                  </span>
                  <div>
                    <div className="text-sm font-bold text-white">Broadcast Announcement</div>
                    <div className="text-xs text-slate-300">Notify all users or faculty</div>
                  </div>
                </button>
                <button className="flex items-center gap-4 p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-left">
                  <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#6bd8cb' }}>
                    category
                  </span>
                  <div>
                    <div className="text-sm font-bold text-white">Manage Subjects</div>
                    <div className="text-xs text-slate-300">Add or archive knowledge nodes</div>
                  </div>
                </button>
                <button className="flex items-center gap-4 p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-left">
                  <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#6bd8cb' }}>
                    admin_panel_settings
                  </span>
                  <div>
                    <div className="text-sm font-bold text-white">User Permissions</div>
                    <div className="text-xs text-slate-300">Elevate or revoke access</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
              <h3 className="font-serif text-xl font-bold mb-6 text-primary">Recent Activity</h3>
              <div className="space-y-6">
                {ACTIVITY_FEED.map((activity, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={`w-2 h-2 rounded-full ${activity.color} mt-2 shrink-0`} />
                    <div>
                      <p className="text-sm text-primary font-medium">{activity.title}</p>
                      <p className="text-xs text-on-surface-variant">{activity.desc}</p>
                      <p className="text-[10px] text-on-surface-variant mt-1 uppercase tracking-widest">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-2 text-sm font-bold text-secondary hover:bg-secondary-container/20 rounded-lg transition-colors">
                View Audit Log
              </button>
            </div>

            {/* Subject Demand Heatmap */}
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
              <h3 className="font-serif text-xl font-bold mb-6 text-primary">Subject Demand</h3>
              <div className="space-y-4">
                {SUBJECT_DEMAND.map((subject, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-wider">
                      <span>{subject.name}</span>
                      <span>{subject.percent}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-secondary" style={{ width: `${subject.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* User Management Section */}
        <section className="mt-12 bg-surface-container-lowest rounded-xl shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-serif text-2xl font-bold text-primary">User Management</h2>
            <div className="flex gap-3">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-surface-container-low border-none rounded-lg text-xs font-semibold px-4 py-2 focus:ring-2 focus:ring-secondary/20 focus:outline-none"
              >
                <option value="all">Role: All</option>
                <option value="student">Student</option>
                <option value="tutor">Faculty</option>
                <option value="admin">Admin</option>
              </select>
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="bg-surface-container-low border-none rounded-lg text-xs px-4 py-2 focus:ring-2 focus:ring-secondary/20 focus:outline-none"
              />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 block mb-4">
                people
              </span>
              <p className="text-on-surface-variant font-medium">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container-low text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant">
                  {filteredUsers.slice(0, 10).map((u) => (
                    <tr key={u._id} className="hover:bg-surface-container transition-colors">
                      <td className="px-6 py-4 font-medium text-primary">{u.name}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                          u.role === 'admin' ? 'bg-primary-container text-primary' :
                          u.role === 'tutor' ? 'bg-secondary-container text-secondary' :
                          'bg-surface-container text-on-surface'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                          u.isActive ? 'bg-secondary-container/30 text-secondary' : 'bg-error-container/30 text-error'
                        }`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => handleToggleActive(u)}
                          className="text-xs font-bold px-3 py-1 rounded hover:bg-surface-container transition-colors"
                        >
                          {u.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="text-xs font-bold px-3 py-1 rounded text-error hover:bg-error-container/20 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
