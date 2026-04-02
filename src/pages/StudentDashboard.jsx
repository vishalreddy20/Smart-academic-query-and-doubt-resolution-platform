import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyDoubts, getSubscription } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import SidebarNav from '../components/SidebarNav';
import TopNavBar from '../components/TopNavBar';
import { Loader, AlertCircle } from 'lucide-react';

const STATUS_CONFIG = {
  open: { bg: 'bg-secondary-container', text: 'text-on-secondary-container', label: 'Open', icon: 'help_outline' },
  claimed: { bg: 'bg-primary-container', text: 'text-primary-fixed-dim', label: 'Claimed', icon: 'person' },
  'in-progress': { bg: 'bg-surface-container', text: 'text-on-surface-variant', label: 'In Progress', icon: 'pending' },
  submitted: { bg: 'bg-primary-container', text: 'text-primary-fixed', label: 'Review Ready', icon: 'mail' },
  resolved: { bg: 'bg-surface-container', text: 'text-on-surface-variant', label: 'Resolved', icon: 'check_circle' },
  disputed: { bg: 'bg-error-container', text: 'text-on-error-container', label: 'Disputed', icon: 'warning' },
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doubts, setDoubts] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [doubtsRes, subRes] = await Promise.allSettled([
        getMyDoubts(),
        getSubscription(),
      ]);
      if (doubtsRes.status === 'fulfilled') setDoubts(doubtsRes.value.data.doubts || []);
      if (subRes.status === 'fulfilled') setSubscription(subRes.value.data.subscription || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDoubts = () => {
    let filtered = doubts;
    
    if (filterTab !== 'all') {
      filtered = filtered.filter(d => d.status === filterTab);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(d =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const stats = [
    { label: 'Total Doubts', value: doubts.length, change: '+3 this week' },
    { label: 'Open', value: doubts.filter(d => d.status === 'open').length, change: '' },
    { label: 'In Progress', value: doubts.filter(d => d.status === 'in-progress' || d.status === 'claimed').length, change: '' },
    { label: 'Resolved', value: doubts.filter(d => d.status === 'resolved').length, change: '' },
  ];

  const filteredDoubts = getFilteredDoubts();

  return (
    <div className="min-h-screen bg-surface">
      {/* Sidebar */}
      <SidebarNav />
      
      {/* Top Navigation */}
      <TopNavBar
        withSidebar
        activePath="/student"
        navItems={[
          { label: 'Dashboard', path: '/student' },
          { label: 'Knowledge Base', path: '/knowledge-base' },
          { label: 'Post Doubt', path: '/post-doubt' },
        ]}
      />

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6 md:px-10 max-w-[1440px] mx-auto md:ml-72 min-h-screen">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-error-container border border-error text-on-error-container p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Hero Section */}
        <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-label text-xs uppercase tracking-widest text-secondary font-bold mb-2 block">Student Workspace</span>
            <h2 className="text-4xl md:text-5xl font-headline text-primary leading-tight max-w-2xl">
              Curating your academic journey with <span className="italic text-secondary">precision.</span>
            </h2>
          </div>
          <button
            onClick={() => navigate('/post-doubt')}
            className="btn-primary flex items-center gap-2 px-6 py-3.5 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span>Post New Doubt</span>
          </button>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="card-elevated p-6 flex flex-col gap-2 border-b-4 border-secondary/20"
            >
              <span className="text-xs uppercase tracking-wider font-medium text-on-surface-variant">
                {stat.label}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-headline font-bold text-primary">{stat.value}</span>
                {stat.change && <span className="text-xs text-secondary font-semibold">{stat.change}</span>}
              </div>
            </div>
          ))}
        </section>

        {/* Filter & Search Section */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            {/* Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {[
                { id: 'all', label: 'All Queries' },
                { id: 'open', label: 'Open' },
                { id: 'in-progress', label: 'Active' },
                { id: 'resolved', label: 'Resolved' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterTab(filter.id)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    filterTab === filter.id
                      ? 'bg-secondary text-on-secondary'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-base">
                search
              </span>
              <input
                type="text"
                placeholder="Filter your doubts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-secondary/30 transition-all placeholder-on-surface-variant/50"
              />
            </div>
          </div>

          {/* Doubts Grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader className="w-8 h-8 animate-spin text-secondary" />
            </div>
          ) : filteredDoubts.length === 0 ? (
            <div className="text-center py-16 bg-surface-container-lowest rounded-xl">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 block mb-4">
                help_outline
              </span>
              <p className="text-on-surface-variant font-medium">
                {doubts.length === 0 ? 'No doubts posted yet' : 'No doubts match your filter'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredDoubts.map((doubt) => {
                const sc = STATUS_CONFIG[doubt.status] || STATUS_CONFIG.open;
                return (
                  <div
                    key={doubt._id}
                    onClick={() => navigate(`/doubt/${doubt._id}`)}
                    className="card-elevated p-8 hover:shadow-[0px_20px_40px_rgba(15,23,42,0.08)] transition-all cursor-pointer group border border-transparent hover:border-secondary/10"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <span className={`${sc.bg} ${sc.text} px-3 py-1 rounded-md text-xs font-bold uppercase tracking-widest`}>
                        {sc.label}
                      </span>
                      <span className="text-on-surface-variant text-xs font-medium">
                        {new Date(doubt.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-headline font-bold text-primary mb-3 leading-tight group-hover:text-secondary transition-colors line-clamp-2">
                      {doubt.title}
                    </h3>

                    {/* Description */}
                    <p className="text-on-surface-variant text-sm leading-relaxed mb-6 line-clamp-2">
                      {doubt.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-6 border-t border-surface-container">
                      <div className="flex items-center gap-2">
                        {doubt.tutorId && (
                          <img
                            src={`https://ui-avatars.com/api/?name=${doubt.tutorId.name}&background=random`}
                            alt={doubt.tutorId.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        )}
                        <span className="text-xs font-medium text-on-surface-variant">
                          {doubt.tutorId?.name || 'Awaiting faculty'}
                        </span>
                      </div>
                      <button className="text-secondary text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all group/btn">
                        View Thread
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Premium Callout - Takes up one card space */}
              <div className="lg:row-span-1 bg-gradient-to-br from-primary to-primary-container p-8 rounded-xl shadow-lg flex flex-col justify-between text-surface-container-lowest relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-headline font-bold mb-4">Elevate your Inquiry.</h3>
                  <p className="text-on-primary-container/90 text-sm leading-relaxed max-w-xs">
                    Our AI-driven pre-analysis helps faculty understand your doubt faster, giving you premium response times.
                  </p>
                </div>
                <div className="mt-8 relative z-10">
                  <button className="inline-flex items-center gap-2 text-secondary-fixed font-bold text-sm hover:underline transition-all">
                    Explore Advanced Tools
                    <span className="material-symbols-outlined text-base">open_in_new</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Curated Resources Section */}
        {!loading && doubts.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-headline font-bold text-primary">Curated for your Profile</h2>
              <button className="text-on-surface-variant text-xs font-bold uppercase tracking-widest hover:text-secondary transition-colors">
                View Library
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { title: 'Epistemology in Modern Science', tag: 'FACULTY RECOMMENDATION' },
                { title: 'Quantum Computing Fundamentals', tag: 'TRENDING' },
                { title: 'Advanced Statistics', tag: 'YOUR SUBJECTS' },
                { title: 'Research Methodology', tag: 'POPULAR' },
              ].map((resource, i) => (
                <div key={i} className="flex flex-col gap-3 group cursor-pointer">
                  <div className="aspect-[3/4] rounded-lg overflow-hidden bg-surface-container shadow-md group-hover:-translate-y-1 transition-all flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">
                      {i % 2 === 0 ? 'description' : 'school'}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-primary line-clamp-2">{resource.title}</span>
                  <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">{resource.tag}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
