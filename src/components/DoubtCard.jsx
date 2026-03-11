import { useState } from 'react';
import { ChevronDown, ChevronUp, User, Calendar } from 'lucide-react';

export default function DoubtCard({ doubt }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CLAIMED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-slate-900 flex-1 pr-4">
            {doubt.title}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(doubt.status)}`}>
            {doubt.status}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          {doubt.subjectId && (
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
              {doubt.subjectId.subjectName}
            </span>
          )}
        </div>

        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
          {doubt.description}
        </p>

        <div className="flex justify-between items-center mb-4">
          {doubt.studentId && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <User className="w-4 h-4" />
              <span>{doubt.studentId.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(doubt.createdAt)}</span>
          </div>
        </div>

        {doubt.status === 'RESOLVED' && doubt.answer && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm transition"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide Answer
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  View Answer
                </>
              )}
            </button>

            {expanded && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {doubt.answer}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
