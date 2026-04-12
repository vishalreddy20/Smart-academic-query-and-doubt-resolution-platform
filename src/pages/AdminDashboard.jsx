import { useState, useEffect } from 'react';
import {
  getStats, getAllUsers, getPendingTutors, approveTutor, rejectTutor,
  deactivateUser, reactivateUser, deleteUserAdmin, createSubject,
  getAllSubjects, deleteSubject, updateSubject, getRecentDoubtsData, getRecentPaymentsData,
} from '../services/api';
import { AlertCircle, CheckCircle, X, Edit2 } from 'lucide-react';
import SidebarNav from '../components/SidebarNav';
import TopNavBar from '../components/TopNavBar';


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
  const [newSubject, setNewSubject] = useState({ name: '', branch: '', description: '', icon: '', color: '#3B82F6' });
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [subjectSearch, setSubjectSearch] = useState('');

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
      if (editingSubject) {
        await updateSubject(editingSubject._id, newSubject);
        showSuccess('Subject updated!');
      } else {
        await createSubject(newSubject);
        showSuccess('Subject created!');
      }
      setNewSubject({ name: '', branch: '', description: '', icon: '', color: '#3B82F6' });
      setShowSubjectForm(false);
      setEditingSubject(null);
      fetchAll();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save subject');
    }
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setNewSubject(subject);
    setShowSubjectForm(true);
  };

  const handleCancelSubjectForm = () => {
    setShowSubjectForm(false);
    setEditingSubject(null);
    setNewSubject({ name: '', branch: '', description: '', icon: '', color: '#3B82F6' });
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

  const filteredSubjects = subjects
    .filter(s => !subjectSearch || s.name?.toLowerCase().includes(subjectSearch.toLowerCase()) || s.branch?.toLowerCase().includes(subjectSearch.toLowerCase()));

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
      <SidebarNav />
      <TopNavBar
        withSidebar
        activePath="/admin"
        navItems={[
          { label: 'Overview', path: '/admin' },
          { label: 'Knowledge Base', path: '/knowledge-base' },
          { label: 'Profile', path: '/profile' },
        ]}
      />

      <main className="pt-24 pb-12 px-6 md:px-10 max-w-[1440px] mx-auto md:ml-72 min-h-screen">
        {error && (
          <div className="mb-8 p-4 bg-error-container border border-error text-on-error-container rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-8 p-4 bg-secondary-container border border-secondary text-on-secondary-container rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl font-headline font-bold text-primary mb-2">Editorial Authority</h1>
              <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
                Orchestrating the flow of academic discourse. Monitor platform health, curate doubt resolution pathways, and manage the elite faculty network.
              </p>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-surface-variant overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: 'dashboard' },
            { id: 'moderation', label: 'Moderation', icon: 'gavel' },
            { id: 'users', label: 'User Management', icon: 'people' },
            { id: 'analytics', label: 'Analytics', icon: 'analytics' },
            { id: 'system', label: 'System Health', icon: 'monitoring' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                </div>
              </div>
              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border-l-4 border-on-secondary-container">
                <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Doubts Resolved</span>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-4xl font-headline font-bold text-primary">{stats.resolvedDoubts || 0}</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Total Subjects</span>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-4xl font-headline font-bold text-primary">{stats.totalSubjects || 0}</span>
                </div>
              </div>
            </section>

            <div className="bg-primary-container text-on-primary rounded-xl p-8 shadow-lg">
              <h3 className="font-serif text-xl font-bold mb-6 text-white">Quick Authority Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => setActiveTab('moderation')} className="flex items-center gap-4 p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-left">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '24px' }}>category</span>
                  <div>
                    <div className="text-sm font-bold text-white">Manage Subjects</div>
                    <div className="text-xs text-slate-300">Add or archive knowledge nodes</div>
                  </div>
                </button>
                <button onClick={() => setActiveTab('users')} className="flex items-center gap-4 p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-left">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '24px' }}>people</span>
                  <div>
                    <div className="text-sm font-bold text-white">Manage Users</div>
                    <div className="text-xs text-slate-300">Elevate or revoke access</div>
                  </div>
                </button>
                <button className="flex items-center gap-4 p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-left">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '24px' }}>campaign</span>
                  <div>
                    <div className="text-sm font-bold text-white">Announcements</div>
                    <div className="text-xs text-slate-300">Notify all users</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Moderation Tab - Subject Management */}
        {activeTab === 'moderation' && (
          <div className="space-y-8">
            <section className="bg-surface-container-lowest rounded-xl shadow-sm p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-serif text-2xl font-bold text-primary">Subject Management</h2>
                <button
                  onClick={() => {
                    setEditingSubject(null);
                    setNewSubject({ name: '', branch: '', description: '', icon: '', color: '#3B82F6' });
                    setShowSubjectForm(true);
                  }}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-bold hover:scale-[1.02] transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Subject
                </button>
              </div>

              {showSubjectForm && (
                <div className="mb-8 p-6 bg-surface-container rounded-lg border border-surface-variant">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-primary">{editingSubject ? 'Edit Subject' : 'Create New Subject'}</h3>
                    <button onClick={handleCancelSubjectForm} className="text-on-surface-variant hover:text-on-surface">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleCreateSubject} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Subject Name"
                        value={newSubject.name}
                        onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                        className="px-4 py-2 bg-surface-container border border-surface-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Branch/Department"
                        value={newSubject.branch}
                        onChange={(e) => setNewSubject({ ...newSubject, branch: e.target.value })}
                        className="px-4 py-2 bg-surface-container border border-surface-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        required
                      />
                    </div>
                    <textarea
                      placeholder="Description"
                      value={newSubject.description}
                      onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                      className="w-full px-4 py-2 bg-surface-container border border-surface-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      rows="3"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Icon URL (optional)"
                        value={newSubject.icon || ''}
                        onChange={(e) => setNewSubject({ ...newSubject, icon: e.target.value })}
                        className="px-4 py-2 bg-surface-container border border-surface-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-on-surface-variant">Color:</label>
                        <input
                          type="color"
                          value={newSubject.color}
                          onChange={(e) => setNewSubject({ ...newSubject, color: e.target.value })}
                          className="w-12 h-10 rounded-lg border border-surface-variant cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-bold hover:scale-[1.02] transition-all"
                      >
                        {editingSubject ? 'Update Subject' : 'Create Subject'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelSubjectForm}
                        className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm font-bold hover:bg-surface-container-high transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                  className="w-full px-4 py-2 bg-surface-container border border-surface-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>

              {filteredSubjects.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 block mb-4">
                    library_books
                  </span>
                  <p className="text-on-surface-variant font-medium">No subjects found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSubjects.map((subject) => (
                    <div key={subject._id} className="p-4 bg-surface-container rounded-lg border border-surface-variant hover:border-primary/50 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          {subject.icon ? (
                            <img src={subject.icon} alt={subject.name} className="w-10 h-10 rounded" />
                          ) : (
                            <div
                              className="w-10 h-10 rounded flex items-center justify-center text-white font-bold text-sm"
                              style={{ backgroundColor: subject.color }}
                            >
                              {subject.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-primary">{subject.name}</h4>
                            <p className="text-xs text-on-surface-variant">{subject.branch}</p>
                          </div>
                        </div>
                      </div>
                      {subject.description && (
                        <p className="text-xs text-on-surface-variant mb-3 line-clamp-2">{subject.description}</p>
                      )}
                      <div className="flex justify-between items-center text-xs text-on-surface-variant mb-4">
                        <span>📊 {subject.doubtsCount || 0} doubts</span>
                        <span>👨‍🏫 {subject.tutorsCount || 0} tutors</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSubject(subject)}
                          className="flex-1 px-3 py-2 rounded text-xs font-bold bg-secondary-container text-secondary hover:bg-secondary-container/80 transition-all flex items-center justify-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(subject._id)}
                          className="flex-1 px-3 py-2 rounded text-xs font-bold bg-error-container text-error hover:bg-error-container/80 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <section className="bg-surface-container-lowest rounded-xl shadow-sm p-8">
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
                    {filteredUsers.slice(0, 20).map((u) => (
                      <tr key={u._id} className="hover:bg-surface-container transition-colors">
                        <td className="px-6 py-4 font-medium text-primary">{u.name}</td>
                        <td className="px-6 py-4 text-on-surface-variant text-xs">{u.email}</td>
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
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <section className="bg-surface-container-lowest rounded-xl shadow-sm p-8">
            <h2 className="font-serif text-2xl font-bold text-primary mb-8">Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-surface-container p-6 rounded-lg">
                <h3 className="font-bold text-primary mb-4">Recent Doubts</h3>
                {recentDoubts.length === 0 ? (
                  <p className="text-on-surface-variant text-sm">No recent doubts</p>
                ) : (
                  <div className="space-y-2">
                    {recentDoubts.slice(0, 5).map((d) => (
                      <div key={d._id} className="p-3 bg-surface-container-low rounded text-xs">
                        <p className="font-medium text-primary line-clamp-2">{d.title}</p>
                        <p className="text-on-surface-variant text-xs">Status: {d.status}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-surface-container p-6 rounded-lg">
                <h3 className="font-bold text-primary mb-4">Recent Payments</h3>
                {recentPayments.length === 0 ? (
                  <p className="text-on-surface-variant text-sm">No recent payments</p>
                ) : (
                  <div className="space-y-2">
                    {recentPayments.slice(0, 5).map((p) => (
                      <div key={p._id} className="p-3 bg-surface-container-low rounded text-xs">
                        <p className="font-medium text-primary">₹{p.amount}</p>
                        <p className="text-on-surface-variant text-xs">{p.paymentStatus}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* System Health Tab */}
        {activeTab === 'system' && (
          <section className="bg-surface-container-lowest rounded-xl shadow-sm p-8">
            <h2 className="font-serif text-2xl font-bold text-primary mb-8">System Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface-container p-6 rounded-lg border-l-4 border-secondary">
                <p className="text-xs text-on-surface-variant mb-2">Database Status</p>
                <p className="text-lg font-bold text-secondary flex items-center gap-2">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  Connected
                </p>
              </div>
              <div className="bg-surface-container p-6 rounded-lg border-l-4 border-secondary">
                <p className="text-xs text-on-surface-variant mb-2">API Status</p>
                <p className="text-lg font-bold text-secondary flex items-center gap-2">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  Operational
                </p>
              </div>
              <div className="bg-surface-container p-6 rounded-lg border-l-4 border-secondary">
                <p className="text-xs text-on-surface-variant mb-2">Response Time</p>
                <p className="text-lg font-bold text-primary">~150ms</p>
              </div>
              <div className="bg-surface-container p-6 rounded-lg border-l-4 border-secondary">
                <p className="text-xs text-on-surface-variant mb-2">Uptime</p>
                <p className="text-lg font-bold text-primary">99.9%</p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
