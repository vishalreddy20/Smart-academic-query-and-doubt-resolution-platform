import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Textarea } from './Textarea';
import { RatingStars } from './RatingStars';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doubtId: string;
  doubtTitle: string;
  onSuccess: () => void;
}

export function RatingModal({ isOpen, onClose, doubtId, doubtTitle, onSuccess }: RatingModalProps) {
  const { profile } = useAuth();
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await (supabase.from('ratings') as any).insert([
        {
          doubt_id: doubtId,
          student_id: profile!.id,
          rating,
          feedback,
        },
      ]);

      if (error) throw error;

      onSuccess();
      onClose();
      setRating(5);
      setFeedback('');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rate Answer Quality">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">How helpful was the answer?</p>
          <p className="font-medium text-gray-900 mb-4">{doubtTitle}</p>
          <RatingStars rating={rating} onRate={setRating} />
        </div>

        <Textarea
          label="Feedback (Optional)"
          placeholder="Share your thoughts on the answer quality..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
        />

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Submit Rating
          </Button>
        </div>
      </form>
    </Modal>
  );
}
