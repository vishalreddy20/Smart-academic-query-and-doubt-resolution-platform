import { useState, useEffect } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { DoubtWithDetails } from '../lib/database.types';
import { Modal } from './Modal';
import { Input } from './Input';
import { DoubtCard } from './DoubtCard';
import { Select } from './Select';

interface KnowledgeBaseProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KnowledgeBase({ isOpen, onClose }: KnowledgeBaseProps) {
  const [resolvedDoubts, setResolvedDoubts] = useState<DoubtWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadResolvedDoubts();
    }
  }, [isOpen]);

  const loadResolvedDoubts = async () => {
    try {
      const { data, error } = await supabase
        .from('doubts')
        .select(`
          *,
          student:profiles!doubts_student_id_fkey(id, full_name, email),
          faculty:profiles!doubts_faculty_id_fkey(id, full_name, email),
          subject:subjects(id, name, description),
          ratings(id, rating, feedback)
        `)
        .eq('status', 'resolved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResolvedDoubts(data || []);
    } catch (error) {
      console.error('Error loading resolved doubts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoubts = resolvedDoubts.filter((doubt) => {
    const matchesSearch =
      doubt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doubt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doubt.answer?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject =
      subjectFilter === 'all' || doubt.subject_id === subjectFilter;

    return matchesSearch && matchesSubject;
  });

  const subjects = Array.from(
    new Set(resolvedDoubts.map((d) => d.subject).filter(Boolean))
  ).map((subject) => ({
    value: subject!.id,
    label: subject!.name,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Knowledge Base" size="xl">
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900 mb-1">Search Previous Solutions</h3>
            <p className="text-sm text-blue-700">
              Browse through previously resolved doubts. Your question might already be answered!
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search in knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Subjects' },
              ...subjects,
            ]}
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading knowledge base...</p>
          </div>
        ) : filteredDoubts.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No resolved doubts found</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {filteredDoubts.map((doubt) => (
              <DoubtCard key={doubt.id} doubt={doubt} />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
