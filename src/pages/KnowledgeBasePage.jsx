import { useState, useEffect } from 'react';
import { getKnowledgeBase, getSubjects } from '../services/api';
import TopNavBar from '../components/TopNavBar';
import { AlertCircle } from 'lucide-react';

const SORT_OPTIONS = ['Most Cited', 'Most Helpful', 'Recent Arrivals'];

export default function KnowledgeBasePage() {
  const [doubts, setDoubts] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedSort, setSelectedSort] = useState('Most Cited');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchSubjectsAndKnowledgeBase();
  }, []);

  useEffect(() => {
    if (subjects.length === 0) return;
    handleSearch();
  }, [selectedSubject]);

  const fetchSubjectsAndKnowledgeBase = async () => {
    try {
      setLoading(true);
      setError('');
      const [subjectsRes, kbRes] = await Promise.all([
        getSubjects(),
        getKnowledgeBase('', '', ''),
      ]);
      setSubjects(subjectsRes.data.subjects || []);
      setDoubts(kbRes.data.doubts || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load knowledge base');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');
      const subjectId = selectedSubject === 'all' ? '' : selectedSubject;
      const { data } = await getKnowledgeBase(searchQuery.trim(), subjectId, '');
      setDoubts(data.doubts || []);
      setCurrentPage(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load knowledge base');
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = [...doubts].sort((a, b) => {
    if (selectedSort === 'Most Helpful') {
      return (b.studentRating || 0) - (a.studentRating || 0);
    }
    if (selectedSort === 'Recent Arrivals') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return (b.views || 0) - (a.views || 0);
  });

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
  const displayCards = filteredCards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-surface">
      {/* Top Navigation */}
      <TopNavBar
        activePath="/knowledge-base"
        navItems={[
          { label: 'Home', path: '/' },
          { label: 'Knowledge Base', path: '/knowledge-base' },
          { label: 'Post Doubt', path: '/post-doubt' },
        ]}
        searchPlaceholder="Search knowledge..."
      />

      {/* Hero Search Section */}
      <section className="relative pt-24 pb-20 px-6 bg-gradient-to-br from-primary to-primary-container overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-black/5" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="font-headline text-5xl md:text-7xl text-white mb-8 leading-tight tracking-tight">
            The Library of Reason
          </h1>
          <p className="text-on-primary text-lg md:text-xl mb-12 max-w-2xl mx-auto font-body leading-relaxed">
            Access centuries of verified academic wisdom, curated for the modern scholar.
          </p>

          {/* Search Input */}
          <div className="relative group max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-on-primary/60">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search the repository of verified academic inquiries..."
              className="w-full pl-14 pr-6 py-5 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-secondary focus:bg-white/20 transition-all placeholder:text-white/40 font-body outline-none"
            />
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 px-6 bg-surface-container-low">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Subject Filters */}
          <div className="flex flex-wrap gap-3">
            {[{ _id: 'all', name: 'All CSE Subjects' }, ...subjects].map((subject) => (
              <button
                key={subject._id}
                onClick={() => {
                  setSelectedSubject(subject._id);
                  setCurrentPage(1);
                }}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedSubject === subject._id
                    ? 'bg-secondary text-white'
                    : 'bg-white text-on-surface border border-outline-variant/30 hover:border-secondary'
                }`}
              >
                {subject.name}
              </button>
            ))}
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-4 text-sm font-medium text-on-surface-variant">
            <span className="uppercase tracking-widest text-[10px]">Sort By</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-transparent border-none focus:ring-0 cursor-pointer font-bold text-on-surface"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-16 px-6 max-w-[1440px] mx-auto">
        {error && (
          <div className="mb-8 p-4 bg-error-container border border-error text-on-error-container rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin">
              <span className="material-symbols-outlined text-4xl text-secondary">hourglass_empty</span>
            </div>
          </div>
        ) : displayCards.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 block mb-4">
              library_books
            </span>
            <p className="text-on-surface-variant font-medium text-lg mb-6">No results found</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('all');
                setCurrentPage(1);
              }}
              className="px-6 py-3 bg-secondary text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
              {displayCards.map((card) => (
                <div
                  key={card._id}
                  className="group bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-transparent hover:border-secondary/20 transition-all flex flex-col h-full"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest bg-secondary-container text-on-secondary-container">
                      {card.subjectId?.name || 'General'}
                    </span>
                    <div className="flex items-center gap-1 text-secondary">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Tutor Solved & Student Rated</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-headline font-bold mb-4 leading-snug group-hover:text-secondary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-base text-on-surface-variant leading-relaxed mb-8 flex-grow line-clamp-3">
                    {card.description}
                  </p>

                  {/* Footer */}
                  <div className="pt-6 mt-6 border-t border-surface-container flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${card.tutorId?.name || 'Tutor'}&background=random`}
                        alt={card.tutorId?.name || 'Tutor'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-[11px] font-bold text-on-surface">
                          {card.tutorId?.name || 'Tutor'}
                        </p>
                        <p className="text-[10px] text-on-surface-variant">
                          {new Date(card.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-bold text-secondary">{Number(card.studentRating || 0).toFixed(1)} / 5 Rating</p>
                      <p className="text-[10px] text-on-surface-variant">{card.views || 0} Views</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <section className="py-12 px-6">
                <div className="max-w-md mx-auto flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-3 rounded-full hover:bg-surface-container-high transition-colors flex items-center gap-2 text-on-surface-variant disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                    <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Previous</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                          page === currentPage
                            ? 'bg-primary text-white'
                            : 'hover:bg-surface-container-high text-on-surface'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    {totalPages > 5 && (
                      <>
                        <span className="px-2 text-on-surface-variant">...</span>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high cursor-pointer text-sm font-medium"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-3 rounded-full hover:bg-surface-container-high transition-colors flex items-center gap-2 text-on-surface-variant disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Next</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low py-12 px-10 border-t border-surface-container-high">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="text-xl font-serif italic font-bold text-primary mb-2">Tutorify</div>
            <p className="text-xs text-on-surface-variant font-medium uppercase tracking-tighter">
              Our Project for Academic Integrity
            </p>
          </div>
          <div className="flex gap-10">
            <a href="#" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-secondary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-secondary transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-secondary transition-colors">
              Academic Ethics
            </a>
          </div>
          <div className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest">
            © 2026 Tutorify. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
