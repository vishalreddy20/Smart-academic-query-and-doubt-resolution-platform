import { useState, useEffect } from 'react';
import { Plus, Search, MessageCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Subject, DoubtWithDetails } from '../lib/database.types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardBody } from '../components/Card';
import { Modal } from '../components/Modal';
import { Select } from '../components/Select';
import { Textarea } from '../components/Textarea';
import { DoubtCard } from '../components/DoubtCard';
import { KnowledgeBase } from '../components/KnowledgeBase';
import { RatingModal } from '../components/RatingModal';

export function StudentDashboard() {
  const { profile } = useAuth();
  const [doubts, setDoubts] = useState<DoubtWithDetails[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDoubtModal, setShowNewDoubtModal] = useState(false);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedDoubtForRating, setSelectedDoubtForRating] = useState<DoubtWithDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [newDoubt, setNewDoubt] = useState({
    title: '',
    description: '',
    subjectId: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;

    try {
      const [doubtsRes, subjectsRes] = await Promise.all([
        supabase
          .from('doubts')
          .select(`
            *,
            student:profiles!doubts_student_id_fkey(id, full_name, email),
            faculty:profiles!doubts_faculty_id_fkey(id, full_name, email),
            subject:subjects(id, name, description),
            ratings(id, rating, feedback, student_id)
          `)
          .eq('student_id', profile.id)
          .order('created_at', { ascending: false }),
        supabase.from('subjects').select('*').order('name'),
      ]);

      if (doubtsRes.error) throw doubtsRes.error;
      if (subjectsRes.error) throw subjectsRes.error;

      setDoubts(doubtsRes.data || []);
      setSubjects(subjectsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoubt = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await (supabase.from('doubts') as any).insert([
        {
          student_id: profile!.id,
          subject_id: newDoubt.subjectId,
          title: newDoubt.title,
          description: newDoubt.description,
          priority: newDoubt.priority,
        },
      ]);

      if (error) throw error;

      setNewDoubt({ title: '', description: '', subjectId: '', priority: 'medium' });
      setShowNewDoubtModal(false);
      loadData();
    } catch (error) {
      console.error('Error creating doubt:', error);
      alert('Failed to create doubt');
    }
  };

  const handleReopenDoubt = async (doubtId: string) => {
    try {
      // Fetch current doubt to see if a faculty is already assigned
      const { data: current, error: fetchError } = await supabase
        .from('doubts')
        .select('faculty_id')
        .eq('id', doubtId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // If a faculty is assigned, set back to in_progress so they can submit an updated answer.
      const newStatus = current?.faculty_id ? 'in_progress' : 'reopened';

      const { error } = await (supabase.from('doubts') as any)
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', doubtId);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error reopening doubt:', error);
    }
  };

  const handleRateDoubt = (doubt: DoubtWithDetails) => {
    setSelectedDoubtForRating(doubt);
    setShowRatingModal(true);
  };

  const filteredDoubts = doubts.filter((doubt) => {
    const matchesSearch =
      doubt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doubt.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' || doubt.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: doubts.length,
    open: doubts.filter((d) => d.status === 'open' || d.status === 'reopened').length,
    inProgress: doubts.filter((d) => d.status === 'in_progress').length,
    resolved: doubts.filter((d) => d.status === 'resolved').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Doubts</h1>
          <p className="text-gray-600 mt-1">Manage and track your academic queries</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Doubts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Open</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.open}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search doubts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'open', label: 'Open' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'reopened', label: 'Reopened' },
            ]}
          />

          <Button onClick={() => setShowKnowledgeBase(true)}>
            <Search className="h-4 w-4 mr-2" />
            Knowledge Base
          </Button>

          <Button onClick={() => setShowNewDoubtModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Doubt
          </Button>
        </div>

        <div className="space-y-4">
          {filteredDoubts.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No doubts found</p>
                <Button className="mt-4" onClick={() => setShowNewDoubtModal(true)}>
                  Post Your First Doubt
                </Button>
              </CardBody>
            </Card>
          ) : (
            filteredDoubts.map((doubt) => (
              <DoubtCard
                key={doubt.id}
                doubt={doubt}
                onReopen={handleReopenDoubt}
                onRate={handleRateDoubt}
                showReopen
              />
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={showNewDoubtModal}
        onClose={() => setShowNewDoubtModal(false)}
        title="Post New Doubt"
      >
        <form onSubmit={handleCreateDoubt} className="space-y-4">
          <Input
            label="Doubt Title"
            placeholder="Brief description of your doubt"
            value={newDoubt.title}
            onChange={(e) => setNewDoubt({ ...newDoubt, title: e.target.value })}
            required
          />

          <Select
            label="Subject"
            value={newDoubt.subjectId}
            onChange={(e) => setNewDoubt({ ...newDoubt, subjectId: e.target.value })}
            options={[
              { value: '', label: 'Select a subject' },
              ...subjects.map((s) => ({ value: s.id, label: s.name })),
            ]}
            required
          />

          <Select
            label="Priority"
            value={newDoubt.priority}
            onChange={(e) => setNewDoubt({ ...newDoubt, priority: e.target.value as 'low' | 'medium' | 'high' })}
            options={[
              { value: 'low', label: 'Low Priority' },
              { value: 'medium', label: 'Medium Priority' },
              { value: 'high', label: 'High Priority' },
            ]}
          />

          <Textarea
            label="Detailed Description"
            placeholder="Explain your doubt in detail..."
            value={newDoubt.description}
            onChange={(e) => setNewDoubt({ ...newDoubt, description: e.target.value })}
            rows={6}
            required
          />

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowNewDoubtModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Post Doubt</Button>
          </div>
        </form>
      </Modal>

      <KnowledgeBase
        isOpen={showKnowledgeBase}
        onClose={() => setShowKnowledgeBase(false)}
      />

      {selectedDoubtForRating && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedDoubtForRating(null);
          }}
          doubtId={selectedDoubtForRating.id}
          doubtTitle={selectedDoubtForRating.title}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
