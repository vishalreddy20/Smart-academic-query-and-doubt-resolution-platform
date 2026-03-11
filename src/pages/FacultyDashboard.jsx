import { useState, useEffect } from 'react';
import { getOpenDoubts, claimDoubt } from '../services/api';
import DoubtCard from '../components/DoubtCard';
import AnswerForm from '../components/AnswerForm';
import { AlertCircle } from 'lucide-react';

export default function FacultyDashboard() {
  const [tab, setTab] = useState('open');
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimingId, setClaimingId] = useState(null);
  const [answeringId, setAnsweringId] = useState(null);

  useEffect(() => {
    fetchDoubts();
  }, [tab]);

  const fetchDoubts = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await getOpenDoubts();
      if (tab === 'open') {
        setDoubts(data.doubts || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching doubts');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (doubtId) => {
    try {
      setClaimingId(doubtId);
      await claimDoubt(doubtId);
      setDoubts(doubts.filter((d) => d._id !== doubtId));
      setAnsweringId(doubtId);
    } catch (err) {
      setError(err.response?.data?.message || 'Error claiming doubt');
    } finally {
      setClaimingId(null);
    }
  };

  const handleAnswered = () => {
    setAnsweringId(null);
    fetchDoubts();
  };

  const openDoubts = doubts.filter((d) => d.status === 'OPEN');
  const myAnsweredDoubts = doubts.filter((d) => d.status === 'RESOLVED');
  const displayDoubts = tab === 'open' ? openDoubts : myAnsweredDoubts;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Faculty Dashboard</h1>

        <div className="flex gap-4 mb-8 border-b border-slate-200">
          <button
            onClick={() => setTab('open')}
            className={`px-6 py-3 font-medium transition border-b-2 ${
              tab === 'open'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Open Doubts ({openDoubts.length})
          </button>
          <button
            onClick={() => setTab('answered')}
            className={`px-6 py-3 font-medium transition border-b-2 ${
              tab === 'answered'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            My Answered ({myAnsweredDoubts.length})
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {answeringId && (
          <div className="mb-8">
            <AnswerForm doubtId={answeringId} onAnswered={handleAnswered} />
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-slate-600">Loading doubts...</p>
          </div>
        ) : displayDoubts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-600">
              {tab === 'open' ? 'No open doubts at the moment' : 'You haven\'t answered any doubts yet'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {displayDoubts.map((doubt) => (
              <div key={doubt._id}>
                <DoubtCard doubt={doubt} />
                {tab === 'open' && (
                  <div className="mt-3">
                    <button
                      onClick={() => handleClaim(doubt._id)}
                      disabled={claimingId === doubt._id}
                      className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {claimingId === doubt._id ? 'Claiming...' : 'Claim & Answer'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
