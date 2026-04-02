import { useState } from 'react';
import { ChevronDown, ChevronUp, User, Calendar, Star, Award, BookOpen } from 'lucide-react';

export default function DoubtCard({ doubt }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':     return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'claimed':  return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-300';
      case 'submitted':return 'bg-purple-100 text-purple-800 border-purple-300';
      default:         return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getDiffColor = (diff) => {
    switch (diff) {
      case 'easy':   return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'hard':   return 'bg-red-100 text-red-700';
      default:       return 'bg-slate-100 text-slate-600';
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

  const hasAnswer = doubt.status === 'resolved' && doubt.solution;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 overflow-hidden">
      <div className="p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          {doubt.subjectId?.name && (
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">
              <BookOpen className="w-3 h-3 inline mr-1" />{doubt.subjectId.name}
            </span>
          )}
          {doubt.difficulty && (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getDiffColor(doubt.difficulty)}`}>
              {doubt.difficulty}
            </span>
          )}
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(doubt.status)}`}>
            {doubt.status}
          </span>
          {doubt.studentRating && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold">
              <Star className="w-3 h-3 fill-amber-400" />{doubt.studentRating}/5
            </span>
          )}
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{doubt.title}</h3>
        <p className="text-slate-500 text-sm mb-4 line-clamp-2">{doubt.description}</p>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex flex-wrap gap-3">
            {doubt.studentId?.name && (
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{doubt.studentId.name}</span>
            )}
            {doubt.tutorId?.name && (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <Award className="w-3.5 h-3.5" />{doubt.tutorId.name}
              </span>
            )}
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(doubt.createdAt)}</span>
          </div>
          {hasAnswer && (
            <button
              onClick={() => setExpanded(!expanded)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                expanded ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100'
              }`}
            >
              {expanded ? <><ChevronUp className="w-3.5 h-3.5" />Hide Answer</> : <><ChevronDown className="w-3.5 h-3.5" />View Answer</>}
            </button>
          )}
        </div>

        {expanded && hasAnswer && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4">
              <p className="text-xs font-bold text-emerald-700 mb-2 uppercase tracking-wide">Expert Answer</p>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{doubt.solution}</p>
              {doubt.studentFeedback && (
                <p className="mt-3 pt-3 border-t border-emerald-200 text-xs text-emerald-700 italic">
                  Student: "{doubt.studentFeedback}"
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
