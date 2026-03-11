import { useState } from 'react';
import { answerDoubt } from '../services/api';
import { Send } from 'lucide-react';

export default function AnswerForm({ doubtId, onAnswered }) {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!answer.trim()) {
      setError('Please provide an answer');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await answerDoubt(doubtId, { answer });

      setSuccess('Doubt resolved successfully!');
      setAnswer('');

      setTimeout(() => {
        onAnswered?.();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Provide Answer</h3>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Write your detailed answer here..."
        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
        rows="6"
        disabled={loading}
      />

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-4 h-4" />
        {loading ? 'Submitting...' : 'Submit Answer'}
      </button>
    </form>
  );
}
