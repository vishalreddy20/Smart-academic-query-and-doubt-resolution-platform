import { useState, useEffect } from 'react';
import { Search, MessageCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Subject, DoubtWithDetails } from '../lib/database.types';
import { Input } from '../components/Input';
import { Card, CardBody } from '../components/Card';
import { Select } from '../components/Select';
import { DoubtCard } from '../components/DoubtCard';

export function FacultyDashboard() {
  const { profile } = useAuth();
  const [doubts, setDoubts] = useState<DoubtWithDetails[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('open');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'available' | 'assigned'>('available');

  useEffect(() => {
    loadData();
    const subscription = supabase
      .channel('doubts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'doubts' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [profile, activeTab]);

  const loadData = async () => {
    if (!profile) return;

    try {
      let query = supabase
        .from('doubts')
        .select(`
          *,
          student:profiles!doubts_student_id_fkey(id, full_name, email),
          faculty:profiles!doubts_faculty_id_fkey(id, full_name, email),
          subject:subjects(id, name, description)
        `)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (activeTab === 'available') {
        query = query.in('status', ['open', 'reopened']).is('faculty_id', null);
      } else {
        query = query.eq('faculty_id', profile.id);
      }

      const [doubtsRes, subjectsRes] = await Promise.all([
        query,
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

  const handleClaimDoubt = async (doubtId: string) => {
    try {
      // Only claim if no one else has claimed (atomic check)
      const { error } = await (supabase.from('doubts') as any)
        .update({
          faculty_id: profile!.id,
          status: 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', doubtId)
        .is('faculty_id', null);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error claiming doubt:', error);
      alert('Failed to claim doubt. It may have been claimed by someone else.');
    }
  };

  const handleSubmitAnswer = async (doubtId: string, answer: string) => {
    try {
      // Ensure only the assigned faculty can submit the answer
      const { error } = await (supabase.from('doubts') as any)
        .update({
          answer,
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', doubtId)
        .eq('faculty_id', profile!.id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Only the assigned faculty can submit.');
    }
  };

  const filteredDoubts = doubts.filter((doubt) => {
    const matchesSearch =
      doubt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doubt.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || doubt.status === filterStatus;

    const matchesSubject =
      filterSubject === 'all' || doubt.subject_id === filterSubject;

    const matchesPriority =
      filterPriority === 'all' || doubt.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesSubject && matchesPriority;
  });

  const stats = {
    total: doubts.length,
    inProgress: doubts.filter((d) => d.status === 'in_progress').length,
    resolved: doubts.filter((d) => d.status === 'resolved').length,
    reopened: doubts.filter((d) => d.status === 'reopened').length,
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
          <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
          <p className="text-gray-600 mt-1">Help students by answering their queries</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {activeTab === 'available' ? 'Available' : 'Total Assigned'}
                  </p>
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
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
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

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Reopened</p>
                  <p className="text-2xl font-bold text-red-600">{stats.reopened}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('available')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'available'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Available Doubts
            </button>
            <button
              onClick={() => setActiveTab('assigned')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'assigned'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Assigned Doubts
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search doubts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {activeTab === 'assigned' && (
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'resolved', label: 'Resolved' },
                { value: 'reopened', label: 'Reopened' },
              ]}
            />
          )}

          <Select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            options={[
              { value: 'all', label: 'All Subjects' },
              ...subjects.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />

          <Select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            options={[
              { value: 'all', label: 'All Priority' },
              { value: 'high', label: 'High Priority' },
              { value: 'medium', label: 'Medium Priority' },
              { value: 'low', label: 'Low Priority' },
            ]}
          />
        </div>

        <div className="space-y-4">
          {filteredDoubts.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {activeTab === 'available'
                    ? 'No available doubts at the moment'
                    : 'No assigned doubts yet'}
                </p>
              </CardBody>
            </Card>
          ) : (
            filteredDoubts.map((doubt) => (
              <DoubtCard
                key={doubt.id}
                doubt={doubt}
                onClaim={activeTab === 'available' ? handleClaimDoubt : undefined}
                onAnswer={activeTab === 'assigned' ? handleSubmitAnswer : undefined}
                showActions
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
