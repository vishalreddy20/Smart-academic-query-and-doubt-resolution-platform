import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoubtDetail, submitSolution, rateSolution, reopenDoubt } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft, BookOpen, Clock, Star, User, Award, CheckCircle,
  AlertCircle, Loader, Send, FileText, Calendar, Eye, Tag,
  RefreshCw, MessageSquare, ThumbsUp, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CONFIG = {
  open:          { color: 'bg-amber-100 text-amber-800 border-amber-300',    label: 'Open',        icon: '📋', gradient: 'from-amber-50 to-yellow-50' },
  claimed:       { color: 'bg-blue-100 text-blue-800 border-blue-300',       label: 'Claimed',     icon: '👤', gradient: 'from-blue-50 to-indigo-50' },
  'in-progress': { color: 'bg-indigo-100 text-indigo-800 border-indigo-300', label: 'In Progress', icon: '⚙️', gradient: 'from-indigo-50 to-violet-50' },
  submitted:     { color: 'bg-purple-100 text-purple-800 border-purple-300', label: 'Answer Ready',icon: '📨', gradient: 'from-purple-50 to-pink-50' },
  resolved:      { color: 'bg-green-100 text-green-800 border-green-300',    label: 'Resolved',    icon: '✅', gradient: 'from-green-50 to-emerald-50' },
  disputed:      { color: 'bg-red-100 text-red-800 border-red-300',          label: 'Disputed',    icon: '⚠️', gradient: 'from-red-50 to-orange-50' },
};

const DIFF_CONFIG = {
  easy:   { color: 'bg-green-100 text-green-700 border-green-200', label: 'Easy' },
  medium: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Medium' },
  hard:   { color: 'bg-red-100 text-red-700 border-red-200',       label: 'Hard' },
};

function StarRating({ value, onChange, readonly = false, size = 'lg' }) {
  const [hover, setHover] = useState(0);
  const sizeClass = size === 'lg' ? 'text-4xl' : 'text-2xl';
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`${sizeClass} transition-all duration-150 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-125 active:scale-110'}`}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => !readonly && onChange && onChange(star)}
        >
          <span className={`transition-colors ${(hover || value) >= star ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
        </button>
      ))}
    </div>
  );
}

const RATING_LABELS = ['', 'Poor — didn\'t help', 'Fair — partially helped', 'Good — mostly clear', 'Very Good — well explained', 'Excellent — perfectly answered'];

export default function DoubtDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doubt, setDoubt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Solution submission (tutor)
  const [solution, setSolution] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSolutionForm, setShowSolutionForm] = useState(false);

  // Rating (student)
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);

  // Reopen (student)
  const [reopenReason, setReopenReason] = useState('');
  const [reopening, setReopening] = useState(false);
  const [showReopenForm, setShowReopenForm] = useState(false);

  useEffect(() => {
    fetchDoubt();
  }, [id]);

  const fetchDoubt = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await getDoubtDetail(id);
      setDoubt(data.doubt);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load doubt');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    if (!solution.trim() || solution.trim().length < 10) {
      setError('Please write at least 10 characters for your solution');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await submitSolution(id, { solution });
      setSuccessMsg('✅ Solution submitted successfully! The student will be notified.');
      setShowSolutionForm(false);
      setSolution('');
      await fetchDoubt();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit solution');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRateSolution = async (e) => {
    e.preventDefault();
    if (!rating) { setError('Please select a star rating'); return; }
    try {
      setRatingSubmitting(true);
      setError('');
      await rateSolution(id, { rating, feedback });
      setSuccessMsg('⭐ Thank you for your rating! Doubt marked as resolved.');
      setShowRatingForm(false);
      setRating(0);
      setFeedback('');
      await fetchDoubt();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleReopen = async (e) => {
    e.preventDefault();
    try {
      setReopening(true);
      setError('');
      await reopenDoubt(id, { reason: reopenReason || 'Student needs more clarification' });
      setSuccessMsg('🔄 Doubt reopened! Any tutor can now claim and answer it again.');
      setShowReopenForm(false);
      setReopenReason('');
      await fetchDoubt();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reopen doubt');
    } finally {
      setReopening(false);
    }
  };

  const getDashboardPath = () => {
    if (user?.role === 'student') return '/student';
    if (user?.role === 'tutor') return '/tutor';
    return '/';
  };

  // Fix: compare as strings to handle ObjectId vs string mismatch
  const isTutorOfDoubt = user?.role === 'tutor' && 
    doubt?.tutorId && 
    (doubt.tutorId._id?.toString() === user?.id?.toString() || 
     doubt.tutorId?.toString() === user?.id?.toString());
  
  const isStudentOfDoubt = user?.role === 'student' && 
    doubt?.studentId && 
    (doubt.studentId._id?.toString() === user?.id?.toString() || 
     doubt.studentId?.toString() === user?.id?.toString());

  const canStudentSeeAnswer = isStudentOfDoubt && ['submitted', 'resolved'].includes(doubt?.status);
  const canStudentRate = isStudentOfDoubt && doubt?.status === 'submitted' && !doubt?.studentRating;
  const canStudentReopen = isStudentOfDoubt && 
    ['submitted', 'resolved'].includes(doubt?.status) && 
    (doubt?.reopenCount || 0) < 2;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="w-20 h-20 rounded-full border-4 border-indigo-100 animate-ping absolute"></div>
            <div className="w-20 h-20 rounded-full border-4 border-t-indigo-600 border-indigo-100 animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading doubt details...</p>
        </div>
      </div>
    );
  }

  if (error && !doubt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Doubt Not Found</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button
            onClick={() => navigate(getDashboardPath())}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[doubt?.status] || STATUS_CONFIG.open;
  const diff = DIFF_CONFIG[doubt?.difficulty] || DIFF_CONFIG.medium;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 text-white shadow-xl">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(getDashboardPath())}
            className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-xl font-medium transition backdrop-blur-sm border border-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-indigo-200 text-xs">Doubt Detail</p>
            <p className="font-bold text-lg truncate">{doubt?.title}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border whitespace-nowrap ${status.color} bg-white/10 backdrop-blur-sm`}>
            {status.icon} {status.label}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-5">
        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3 shadow-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
            </motion.div>
          )}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl flex items-center gap-3 shadow-sm"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{successMsg}</span>
              <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Question Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden"
        >
          <div className={`bg-gradient-to-r ${status.gradient} border-b border-slate-100 px-6 py-5`}>
            <div className="flex flex-wrap gap-2 items-center mb-3">
              {doubt?.subjectId && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-200">
                  <BookOpen className="w-3 h-3" />
                  {doubt.subjectId.name}
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${diff.color}`}>
                {diff.label}
              </span>
              {doubt?.isReopened && (
                <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold border border-orange-200">
                  <RefreshCw className="w-3 h-3" />
                  Reopened ({doubt.reopenCount}x)
                </span>
              )}
              {doubt?.views > 0 && (
                <span className="flex items-center gap-1 text-slate-500 text-xs ml-auto">
                  <Eye className="w-3.5 h-3.5" /> {doubt.views} views
                </span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">{doubt?.title}</h1>
          </div>

          <div className="px-6 py-5">
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-base">{doubt?.description}</p>
            {doubt?.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {doubt.tags.map((tag, i) => (
                  <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                    <Tag className="w-3 h-3" />{tag}
                  </span>
                ))}
              </div>
            )}
            {doubt?.deadline && (
              <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-xl w-fit border border-amber-200">
                <Calendar className="w-4 h-4" />
                Deadline: {new Date(doubt.deadline).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {doubt?.studentId?.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{doubt?.studentId?.name || 'Anonymous'}</p>
                {doubt?.studentId?.college && (
                  <p className="text-xs text-slate-500">{doubt.studentId.college}</p>
                )}
              </div>
            </div>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(doubt?.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
            </span>
          </div>
        </motion.div>

        {/* Tutor Info Card */}
        {doubt?.tutorId && (
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl px-6 py-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                {(doubt.tutorId.name || 'T').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-xs text-emerald-700 font-medium">
                  {['submitted', 'resolved'].includes(doubt.status) ? 'Answered by' : 'Being solved by'}
                </p>
                <p className="font-bold text-slate-900">{doubt.tutorId.name}</p>
              </div>
              {doubt.tutorId.rating > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl shadow-sm border border-emerald-100">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-slate-900 text-sm">{doubt.tutorId.rating?.toFixed(1)}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ===== SOLUTION SECTION ===== */}
        {(doubt?.status === 'submitted' || doubt?.status === 'resolved') && doubt?.solution && (
          <motion.div
            initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Tutor's Answer</h2>
              </div>
              {doubt.submittedAt && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(doubt.submittedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </span>
              )}
            </div>

            <div className="px-6 py-5">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <p className="text-slate-800 leading-relaxed whitespace-pre-wrap text-base font-mono text-sm">
                  {doubt.solution}
                </p>
              </div>
            </div>

            {/* Student Rating display (if already rated) */}
            {doubt.status === 'resolved' && doubt.studentRating && (
              <div className="px-6 pb-5 border-t border-slate-100 pt-4">
                <p className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" /> Student Rating
                </p>
                <div className="flex items-center gap-3">
                  <StarRating value={doubt.studentRating} readonly size="sm" />
                  <span className="text-sm font-bold text-amber-600">{doubt.studentRating}/5</span>
                  <span className="text-sm text-slate-500">{RATING_LABELS[doubt.studentRating]}</span>
                </div>
                {doubt.studentFeedback && (
                  <blockquote className="mt-3 pl-4 border-l-4 border-amber-200 text-sm text-slate-600 italic">
                    "{doubt.studentFeedback}"
                  </blockquote>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ===== STUDENT ACTIONS ===== */}
        {/* Rate Solution prompt */}
        {canStudentRate && !showRatingForm && !showReopenForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl px-6 py-6 shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Star className="w-6 h-6 text-amber-500 fill-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-slate-900 text-lg mb-1">Your Answer is Ready! ⭐</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Review the tutor's solution above and rate it. Your rating helps other students find quality answers!
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowRatingForm(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition shadow-md hover:shadow-amber-200"
                  >
                    <Star className="w-4 h-4" />
                    Rate This Answer
                  </button>
                  {canStudentReopen && (
                    <button
                      onClick={() => setShowReopenForm(true)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold border border-slate-200 transition text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Still Confused? Reopen
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Rating Form */}
        <AnimatePresence>
          {canStudentRate && showRatingForm && (
            <motion.form
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              onSubmit={handleRateSolution}
              className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-4 border-b border-amber-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" /> Rate This Solution
                </h2>
                <button type="button" onClick={() => { setShowRatingForm(false); setRating(0); setFeedback(''); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-amber-100 transition text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-6 py-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Your Rating *</label>
                  <StarRating value={rating} onChange={setRating} />
                  {rating > 0 && (
                    <p className="mt-2 text-amber-600 font-semibold text-sm">{RATING_LABELS[rating]}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Feedback (Optional)</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Share what was helpful or what could be improved..."
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none text-sm text-slate-700 placeholder-slate-400"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={ratingSubmitting || !rating}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-200"
                  >
                    {ratingSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                    {ratingSubmitting ? 'Submitting...' : 'Submit Rating & Resolve'}
                  </button>
                  <button type="button" onClick={() => { setShowRatingForm(false); setRating(0); setFeedback(''); }}
                    className="px-5 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Reopen Form */}
        <AnimatePresence>
          {showReopenForm && (
            <motion.form
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              onSubmit={handleReopen}
              className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-orange-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-orange-500" /> Reopen This Doubt
                </h2>
                <button type="button" onClick={() => setShowReopenForm(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-orange-100 transition text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-6 py-6 space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
                  <p className="font-bold mb-1">How reopening works:</p>
                  <ul className="space-y-1 text-orange-700 text-sm">
                    <li>• Your doubt goes back to <strong>Open</strong> status</li>
                    <li>• Any qualified tutor can claim and answer it</li>
                    <li>• You can reopen up to 2 times per doubt</li>
                    <li>• Remaining reopens: <strong>{2 - (doubt?.reopenCount || 0)}</strong></li>
                  </ul>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Why are you reopening? (Optional)</label>
                  <textarea
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    placeholder="e.g., The explanation wasn't clear enough, I need more examples..."
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={reopening}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-200 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
                  >
                    {reopening ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {reopening ? 'Reopening...' : 'Reopen Doubt'}
                  </button>
                  <button type="button" onClick={() => setShowReopenForm(false)}
                    className="px-5 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Reopen button for resolved doubts (after rating) */}
        {isStudentOfDoubt && doubt?.status === 'resolved' && canStudentReopen && !showReopenForm && (
          <div className="flex justify-center">
            <button
              onClick={() => setShowReopenForm(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-orange-50 text-orange-600 font-semibold rounded-xl border border-orange-200 transition text-sm shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Still need help? Reopen this doubt ({2 - (doubt?.reopenCount || 0)} reopens left)
            </button>
          </div>
        )}

        {/* ===== TUTOR ACTIONS ===== */}
        {isTutorOfDoubt && (doubt?.status === 'claimed' || doubt?.status === 'in-progress') && !showSolutionForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-3xl px-6 py-6 shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-slate-900 text-lg mb-1">You've Claimed This Doubt!</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Write a thorough, step-by-step solution. The student is waiting for your help.
                </p>
                <button
                  onClick={() => setShowSolutionForm(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-md hover:shadow-emerald-200"
                >
                  <Send className="w-4 h-4" />
                  Write Your Solution
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Solution Form (Tutor) */}
        <AnimatePresence>
          {isTutorOfDoubt && (doubt?.status === 'claimed' || doubt?.status === 'in-progress') && showSolutionForm && (
            <motion.form
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmitSolution}
              className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-600" /> Submit Your Solution
                </h2>
                <button type="button" onClick={() => { setShowSolutionForm(false); setSolution(''); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-emerald-100 transition text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-6 py-6 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                  <p className="font-semibold mb-1">💡 Tips for a great answer:</p>
                  <ul className="space-y-0.5 text-blue-700 text-xs">
                    <li>• Break down the solution into clear steps</li>
                    <li>• Include examples where possible</li>
                    <li>• Explain the reasoning, not just the steps</li>
                  </ul>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Your Solution *</label>
                  <textarea
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    placeholder="Write a detailed, step-by-step solution here. Be thorough and clear..."
                    rows={12}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-y text-sm font-mono min-h-48"
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-slate-400">Aim for at least 100 characters</p>
                    <p className={`text-xs font-medium ${solution.length < 10 ? 'text-red-400' : solution.length < 100 ? 'text-amber-500' : 'text-green-500'}`}>
                      {solution.length} chars
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting || solution.trim().length < 10}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-200 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-200"
                  >
                    {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {submitting ? 'Submitting...' : 'Submit Solution'}
                  </button>
                  <button type="button" onClick={() => { setShowSolutionForm(false); setSolution(''); }}
                    className="px-5 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Resolved Banner */}
        {doubt?.status === 'resolved' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl px-6 py-5 flex items-center gap-4 shadow-sm"
          >
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-green-900 text-lg">Doubt Fully Resolved! 🎉</h3>
              <p className="text-sm text-green-700">This doubt has been answered, rated, and closed.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
