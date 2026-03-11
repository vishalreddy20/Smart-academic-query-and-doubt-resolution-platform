import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postDoubt, getSubjects } from '../services/api';
import { Send as SendIcon, AlertCircle } from 'lucide-react';

export default function PostDoubtPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data } = await getSubjects();
      setSubjects(data.subjects || []);
      if (data.subjects && data.subjects.length > 0) {
        setSubjectId(data.subjects[0]._id);
      }
    } catch (err) {
      setError('Error loading subjects');
    }
  };

  const validateForm = () => {
    if (!subjectId || !title.trim() || !description.trim()) {
      setError('Please fill in all fields');
      return false;
    }
    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters');
      return false;
    }
    if (description.trim().length < 20) {
      setError('Description must be at least 20 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      await postDoubt({
        subjectId,
        title,
        description,
      });

      setSuccess('Doubt posted successfully! Redirecting...');
      setTimeout(() => {
        navigate('/student');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error posting doubt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Post a Doubt</h1>
          <p className="text-slate-600 mb-8">
            Share your question with faculty members and get expert answers
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Subject
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              >
                <option value="">Choose a subject...</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Question Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief title of your question"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
              <p className="text-xs text-slate-500 mt-1">
                {title.length}/100 characters (min 5)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Detailed Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed context and describe your doubt clearly..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="8"
                disabled={loading}
              />
              <p className="text-xs text-slate-500 mt-1">
                {description.length}/1000 characters (min 20)
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SendIcon className="w-5 h-5" />
                {loading ? 'Posting...' : 'Post Doubt'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/student')}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
