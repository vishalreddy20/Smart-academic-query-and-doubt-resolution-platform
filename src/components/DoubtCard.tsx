import { Clock, User, BookOpen, AlertCircle, Star } from 'lucide-react';
import { Card, CardBody, CardHeader, CardFooter } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import type { DoubtWithDetails } from '../lib/database.types';
import { RatingStars } from './RatingStars';
import { useState } from 'react';
import { Modal } from './Modal';

interface DoubtCardProps {
  doubt: DoubtWithDetails;
  onReopen?: (id: string) => void;
  onRate?: (doubt: DoubtWithDetails) => void;
  showReopen?: boolean;
  onAnswer?: (id: string, answer: string) => void;
  onClaim?: (id: string) => void;
  showActions?: boolean;
}

export function DoubtCard({ doubt, onReopen, onRate, showReopen, onAnswer, onClaim, showActions }: DoubtCardProps) {
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const statusVariants = {
    open: 'warning',
    in_progress: 'info',
    resolved: 'success',
    reopened: 'danger',
  } as const;

  const priorityVariants = {
    low: 'default',
    medium: 'warning',
    high: 'danger',
  } as const;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Card hover>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{doubt.title}</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant={statusVariants[doubt.status]}>
                  {doubt.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge variant={priorityVariants[doubt.priority]}>
                  {doubt.priority.toUpperCase()} PRIORITY
                </Badge>
                {doubt.subject && (
                  <Badge variant="info">
                    <BookOpen className="h-3 w-3 mr-1 inline" />
                    {doubt.subject.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          <p className="text-gray-700 line-clamp-3">{doubt.description}</p>

          {doubt.answer && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-green-700" />
                <span className="text-sm font-medium text-green-700">
                  Answer by {doubt.faculty?.full_name || 'Faculty'}
                </span>
              </div>
              <p className="text-gray-800 line-clamp-3">{doubt.answer}</p>
              {doubt.ratings && doubt.ratings.length > 0 && (
                <div className="mt-2">
                  <RatingStars rating={doubt.ratings[0].rating} readonly />
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {doubt.student?.full_name || 'Unknown'}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDate(doubt.created_at)}
            </div>
            {doubt.faculty && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4 text-green-600" />
                <span className="text-green-600">{doubt.faculty.full_name}</span>
              </div>
            )}
          </div>
        </CardBody>

        <CardFooter>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setShowDetailsModal(true)}>
              View Details
            </Button>

            {showReopen && doubt.status === 'resolved' && (
              <>
                {onRate && (!doubt.ratings || doubt.ratings.length === 0) && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => onRate(doubt)}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Rate Answer
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onReopen?.(doubt.id)}
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Reopen
                </Button>
              </>
            )}

            {showActions && doubt.status === 'open' && !doubt.faculty_id && (
              <Button size="sm" onClick={() => onClaim?.(doubt.id)}>
                Claim Doubt
              </Button>
            )}

            {showActions && (doubt.status === 'in_progress' || doubt.status === 'reopened') && onAnswer && (
              <Button variant="success" size="sm" onClick={() => setShowAnswerModal(true)}>
                Submit Answer
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Doubt Details"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Title</h3>
            <p className="text-gray-700">{doubt.title}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{doubt.description}</p>
          </div>

          {doubt.answer && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Answer</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{doubt.answer}</p>
              <p className="text-sm text-green-700 mt-2">
                Answered by {doubt.faculty?.full_name || 'Faculty'}
              </p>
            </div>
          )}
        </div>
      </Modal>

      {onAnswer && (
        <Modal
          isOpen={showAnswerModal}
          onClose={() => setShowAnswerModal(false)}
          title="Submit Answer"
          size="lg"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const answer = formData.get('answer') as string;
              onAnswer(doubt.id, answer);
              setShowAnswerModal(false);
            }}
            className="space-y-4"
          >
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Question</h3>
              <p className="text-gray-700">{doubt.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Answer
              </label>
              <textarea
                name="answer"
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Provide a detailed answer to help the student..."
                required
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="secondary" onClick={() => setShowAnswerModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="success">
                Submit Answer
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
