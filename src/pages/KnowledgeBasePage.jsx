import { useState, useEffect } from 'react';
import { getResolvedDoubts } from '../services/api';
import DoubtCard from '../components/DoubtCard';
import SearchBar from '../components/SearchBar';
import { AlertCircle } from 'lucide-react';

export default function KnowledgeBasePage() {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDoubts(searchQuery);
  }, [searchQuery]);

  const fetchDoubts = async (search) => {
    try {
      setLoading(true);
      const { data } = await getResolvedDoubts(search);
      setDoubts(data.doubts || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching doubts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Knowledge Base</h1>
          <p className="text-slate-600 mb-6">
            Browse previously answered questions and find solutions
          </p>

          <SearchBar
            onSearch={handleSearch}
            placeholder="Search resolved doubts..."
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-slate-600">Searching knowledge base...</p>
          </div>
        ) : doubts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-600">
              {searchQuery ? 'No results found for your search' : 'No resolved doubts available yet'}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-600 mb-6">
              Found {doubts.length} {doubts.length === 1 ? 'result' : 'results'}
            </p>
            <div className="grid gap-6">
              {doubts.map((doubt) => (
                <DoubtCard key={doubt._id} doubt={doubt} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
