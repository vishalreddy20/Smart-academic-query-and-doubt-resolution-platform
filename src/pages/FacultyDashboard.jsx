import { useState, useEffect } from 'react';
import { getOpenDoubts, getClaimedDoubts, getResolvedDoubts, claimDoubt, submitSolution } from '../services/api';
import SidebarNav from '../components/SidebarNav';
import TopNavBar from '../components/TopNavBar';
import { AlertCircle, CheckCircle } from 'lucide-react';

const URGENCY_CONFIG = {
  critical: { bg: 'border-error', label: 'Critical', color: 'bg-error-container text-error' },
  high: { bg: 'border-amber-400', label: 'High Priority', color: 'bg-amber-100 text-amber-700' },
  standard: { bg: 'border-secondary', label: 'Standard', color: 'bg-secondary-container text-secondary' },
};

export default function FacultyDashboard() {
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [openDoubts, setOpenDoubts] = useState([]);
  const [claimedDoubts, setClaimedDoubts] = useState([]);
  const [resolvedDoubts, setResolvedDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [claimingId, setClaimingId] = useState(null);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [solutionText, setSolutionText] = useState('');
  const [submittingId, setSubmittingId] = useState(null);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchAllDoubts();
  }, []);

  const fetchAllDoubts = async () => {
    try {
      setLoading(true);
      setError('');
      const [openRes, claimedRes, resolvedRes] = await Promise.all([
        getOpenDoubts(),
        getClaimedDoubts(),
        getResolvedDoubts(),
      ]);
      setOpenDoubts(openRes.data.doubts || []);
      setClaimedDoubts(claimedRes.data.doubts || []);
      setResolvedDoubts(resolvedRes.data.doubts || []);
      const uniqueSubjects = [...new Set((openRes.data.doubts || []).map(d => d.subjectId?.name).filter(Boolean))];
      setSubjects(uniqueSubjects);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching doubts');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (doubtId) => {
    try {
      setClaimingId(doubtId);
      setError('');
      await claimDoubt(doubtId);
      setSuccessMsg('Doubt claimed successfully!');
      setOpenDoubts(openDoubts.filter(d => d._id !== doubtId));
      const claimedDoubt = openDoubts.find(d => d._id === doubtId);
      if (claimedDoubt) {
        setClaimedDoubts([{ ...claimedDoubt, status: 'claimed' }, ...claimedDoubts]);
      }
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error claiming doubt');
    } finally {
      setClaimingId(null);
    }
  };

  const handleSubmitSolution = async () => {
    if (!solutionText.trim()) {
      setError('Please provide a solution');
      return;
    }
    try {
      setSubmittingId(selectedDoubt._id);
      setError('');
      await submitSolution(selectedDoubt._id, { solution: solutionText });
      setSuccessMsg('Solution submitted successfully!');
      setClaimedDoubts(claimedDoubts.filter(d => d._id !== selectedDoubt._id));
      const submittedDoubt = { ...selectedDoubt, status: 'submitted', solution: solutionText };
      setResolvedDoubts([submittedDoubt, ...resolvedDoubts]);
      setSolutionText('');
      setSelectedDoubt(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting solution');
    } finally {
      setSubmittingId(null);
    }
  };

  const getFilteredOpenDoubts = () => {
    return openDoubts.filter(d => {
      const subjectMatch = filterSubject === 'all' || d.subjectId?.name === filterSubject;
      const urgencyMatch = filterUrgency === 'all' || d.urgency === filterUrgency;
      return subjectMatch && urgencyMatch;
    });
  };

  const getUrgencyConfig = (urgency) => {
    return URGENCY_CONFIG[urgency] || URGENCY_CONFIG.standard;
  };

  const stats = [
    { label: 'Unclaimed Doubts', value: openDoubts.length, change: '+5 new' },
    { label: 'Claimed by Me', value: claimedDoubts.length, change: 'active sessions' },
    { label: 'Resolved Today', value: resolvedDoubts.filter(d => {
      const today = new Date().toDateString();
      return new Date(d.createdAt).toDateString() === today;
    }).length, change: 'Goal: 15' },
  ];

  const filteredOpenDoubts = getFilteredOpenDoubts();

  if (loading && openDoubts.length === 0) {
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
        activePath="/tutor"
        navItems={[
          { label: 'Faculty Queue', path: '/tutor' },
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

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="card-elevated p-6 flex flex-col justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                {stat.label}
              </span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-headline font-bold text-on-surface">{stat.value}</span>
                <span className={`text-sm font-medium ${stat.change.includes('Goal') ? 'text-on-surface-variant' : 'text-secondary'}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
          
          {/* Performance Card */}
          <div className="bg-primary-container text-surface-container-lowest p-6 rounded-xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-xs uppercase tracking-widest opacity-70 font-semibold">Avg. Response Time</span>
              <div className="mt-4">
                <span className="text-3xl font-headline font-bold italic">14.2m</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-[85%]" />
                </div>
                <span className="text-xs font-bold">TOP 5%</span>
              </div>
            </div>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl opacity-5 rotate-12">
              monitoring
            </span>
          </div>
        </section>

        {/* Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Faculty Queue - Left Column (8 cols) */}
          <section className="lg:col-span-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/20 pb-4">
              <div>
                <h2 className="text-3xl font-headline font-bold text-primary">Open Academic Queue</h2>
                <p className="text-on-surface-variant text-sm mt-1">Real-time inquiries awaiting expert resolution.</p>
              </div>
              <div className="flex gap-3">
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="bg-surface-container-low border-none rounded-lg text-xs font-semibold px-4 py-2 focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all"
                >
                  <option value="all">Subject: All</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
                <select
                  value={filterUrgency}
                  onChange={(e) => setFilterUrgency(e.target.value)}
                  className="bg-surface-container-low border-none rounded-lg text-xs font-semibold px-4 py-2 focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all"
                >
                  <option value="all">Urgency: All</option>
                  <option value="critical">Critical (&lt; 1h)</option>
                  <option value="high">High (&lt; 4h)</option>
                  <option value="standard">Standard</option>
                </select>
              </div>
            </div>

            {/* Doubt Cards List */}
            <div className="space-y-4">
              {filteredOpenDoubts.length === 0 ? (
                <div className="text-center py-16 bg-surface-container-lowest rounded-xl">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 block mb-4">
                    inbox
                  </span>
                  <p className="text-on-surface-variant font-medium">
                    {openDoubts.length === 0 ? 'No open doubts' : 'No doubts match your filters'}
                  </p>
                </div>
              ) : (
                filteredOpenDoubts.map((doubt) => {
                  const urgencyConfig = getUrgencyConfig(doubt.urgency || 'standard');
                  const timeAgo = Math.round((Date.now() - new Date(doubt.createdAt)) / 60000);
                  return (
                    <div
                      key={doubt._id}
                      className={`group bg-surface-container-lowest p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-l-4 ${urgencyConfig.bg}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`px-2 py-1 ${urgencyConfig.color} text-xs font-bold uppercase tracking-wider rounded`}>
                            {urgencyConfig.label}
                          </span>
                          <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">
                            {doubt.subjectId?.name || 'General'}
                          </span>
                        </div>
                        <span className="text-xs text-on-surface-variant font-medium whitespace-nowrap ml-2">
                          {timeAgo} mins ago
                        </span>
                      </div>
                      <h3 className="text-lg font-headline font-bold mb-2 group-hover:text-secondary transition-colors line-clamp-2">
                        {doubt.title}
                      </h3>
                      <p className="text-sm text-on-surface-variant line-clamp-2 mb-6">
                        {doubt.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex -space-x-2">
                          {doubt.studentId && (
                            <img
                              src={`https://ui-avatars.com/api/?name=${doubt.studentId.name}&background=random`}
                              alt={doubt.studentId.name}
                              className="w-8 h-8 rounded-full border-2 border-surface"
                            />
                          )}
                        </div>
                        <button
                          onClick={() => handleClaim(doubt._id)}
                          disabled={claimingId === doubt._id}
                          className="flex items-center gap-2 px-6 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-sm">assignment_turned_in</span>
                          {claimingId === doubt._id ? 'Claiming...' : 'Claim Doubt'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Sidebar - Right Column (4 cols) */}
          <aside className="lg:col-span-4 space-y-8">
            {/* In Progress Section */}
            <div className="bg-surface-container-low p-6 rounded-2xl shadow-sm border border-outline-variant/10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-headline font-bold text-primary">In Progress ({claimedDoubts.length})</h2>
                <button className="text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
              </div>
              <div className="space-y-3">
                {claimedDoubts.length === 0 ? (
                  <p className="text-on-surface-variant text-sm text-center py-8">No claimed doubts yet</p>
                ) : (
                  claimedDoubts.slice(0, 2).map((doubt) => (
                    <div
                      key={doubt._id}
                      onClick={() => setSelectedDoubt(doubt)}
                      className="p-4 bg-surface-container-lowest rounded-xl hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-bold uppercase text-secondary">
                          {doubt.subjectId?.name || 'General'}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          {Math.round((Date.now() - new Date(doubt.createdAt)) / 3600000)}h left
                        </span>
                      </div>
                      <p className="text-xs font-bold text-on-surface mb-3 group-hover:text-secondary transition-colors line-clamp-2">
                        {doubt.title}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDoubt(doubt);
                        }}
                        className="w-full py-2 bg-secondary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Quick Response
                      </button>
                    </div>
                  ))
                )}
              </div>
              {claimedDoubts.length > 2 && (
                <button className="w-full mt-4 py-3 border border-outline-variant text-on-surface-variant text-xs font-semibold rounded-xl hover:bg-surface-container transition-colors">
                  View All Active Sessions
                </button>
              )}
            </div>

            {/* Faculty Insights */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-headline font-bold text-primary mb-6">Faculty Insights</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-secondary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary text-sm">star</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface">Student Satisfaction</p>
                      <p className="text-xs text-on-surface-variant">4.92 / 5.00 average</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-secondary">+2.1%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary-fixed-dim flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-sm">bolt</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface">Quick Resolution Rate</p>
                      <p className="text-xs text-on-surface-variant">78% within 2 hours</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-secondary">+5.3%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface text-sm">trending_up</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface">Monthly Growth</p>
                      <p className="text-xs text-on-surface-variant">156 solutions submitted</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-secondary">+12%</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Solution Modal */}
        {selectedDoubt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-surface p-6 border-b border-outline-variant/20 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-headline font-bold text-primary mb-2">
                    {selectedDoubt.title}
                  </h2>
                  <p className="text-on-surface-variant text-sm">
                    {selectedDoubt.subjectId?.name || 'General'} • {selectedDoubt.studentId?.name || 'Anonymous'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDoubt(null)}
                  className="text-on-surface-variant hover:text-primary"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                    Query Description
                  </h3>
                  <p className="text-on-surface leading-relaxed">
                    {selectedDoubt.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                    Your Solution
                  </h3>
                  <textarea
                    value={solutionText}
                    onChange={(e) => setSolutionText(e.target.value)}
                    placeholder="Provide your expert solution here..."
                    className="w-full bg-surface-container-low border-none rounded-xl py-4 px-4 text-on-surface focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all placeholder-on-surface-variant/50 min-h-[250px] resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedDoubt(null)}
                    className="flex-1 px-6 py-4 bg-surface-container text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitSolution}
                    disabled={submittingId === selectedDoubt._id}
                    className="flex-1 btn-primary py-4 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingId === selectedDoubt._id ? 'Submitting...' : 'Submit Solution'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
