import { useState, useEffect } from 'react';
import { Users, MessageCircle, BookOpen, TrendingUp, BarChart3, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile, Subject } from '../lib/database.types';
import { Button } from '../components/Button';
import { Card, CardBody, CardHeader } from '../components/Card';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';

interface Stats {
  totalUsers: number;
  totalStudents: number;
  totalFaculty: number;
  totalDoubts: number;
  openDoubts: number;
  resolvedDoubts: number;
  avgResolutionTime: string;
  totalSubjects: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalDoubts: 0,
    openDoubts: 0,
    resolvedDoubts: 0,
    avgResolutionTime: '0h',
    totalSubjects: 0,
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', description: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profilesRes, doubtsRes, subjectsRes] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('doubts').select('*'),
        supabase.from('subjects').select('*'),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (doubtsRes.error) throw doubtsRes.error;
      if (subjectsRes.error) throw subjectsRes.error;

      const profiles = (profilesRes.data || []) as any[];
      const doubts = (doubtsRes.data || []) as any[];
      const subjectsData = (subjectsRes.data || []) as any[];

      const resolvedDoubts = doubts.filter((d) => d.status === 'resolved');
      let avgTime = 0;
      if (resolvedDoubts.length > 0) {
        const totalTime = resolvedDoubts.reduce((acc, doubt) => {
          if (doubt.resolved_at) {
            const created = new Date(doubt.created_at).getTime();
            const resolved = new Date(doubt.resolved_at).getTime();
            return acc + (resolved - created);
          }
          return acc;
        }, 0);
        avgTime = totalTime / resolvedDoubts.length / (1000 * 60 * 60);
      }

      setStats({
        totalUsers: profiles.length,
        totalStudents: profiles.filter((p) => p.role === 'student').length,
        totalFaculty: profiles.filter((p) => p.role === 'faculty').length,
        totalDoubts: doubts.length,
        openDoubts: doubts.filter((d) => d.status === 'open' || d.status === 'reopened').length,
        resolvedDoubts: resolvedDoubts.length,
        avgResolutionTime: `${avgTime.toFixed(1)}h`,
        totalSubjects: subjectsData.length,
      });

      setSubjects(subjectsData);
      setUsers(profiles);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await (supabase.from('subjects') as any).insert([newSubject]);

      if (error) throw error;

      setNewSubject({ name: '', description: '' });
      setShowAddSubjectModal(false);
      loadData();
    } catch (error) {
      console.error('Error adding subject:', error);
      alert('Failed to add subject');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      const { error } = await supabase.from('subjects').delete().eq('id', id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Failed to delete subject. It may be in use.');
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">System overview and management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.totalStudents} students, {stats.totalFaculty} faculty
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Doubts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDoubts}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.openDoubts} open, {stats.resolvedDoubts} resolved
                  </p>
                </div>
                <MessageCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Subjects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSubjects}</p>
                  <p className="text-xs text-gray-500 mt-1">Active categories</p>
                </div>
                <BookOpen className="h-8 w-8 text-yellow-600" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Resolution</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgResolutionTime}</p>
                  <p className="text-xs text-gray-500 mt-1">Response time</p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-600" />
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">User Distribution</h2>
                <BarChart3 className="h-5 w-5 text-gray-600" />
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Students</span>
                    <span className="text-sm font-medium text-gray-900">{stats.totalStudents}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(stats.totalStudents / stats.totalUsers) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Faculty</span>
                    <span className="text-sm font-medium text-gray-900">{stats.totalFaculty}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${(stats.totalFaculty / stats.totalUsers) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Doubt Status</h2>
                <MessageCircle className="h-5 w-5 text-gray-600" />
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Open</span>
                    <span className="text-sm font-medium text-gray-900">{stats.openDoubts}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full"
                      style={{
                        width: `${(stats.openDoubts / stats.totalDoubts) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Resolved</span>
                    <span className="text-sm font-medium text-gray-900">{stats.resolvedDoubts}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${(stats.resolvedDoubts / stats.totalDoubts) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Subject Management</h2>
              <Button size="sm" onClick={() => setShowAddSubjectModal(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Subject
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteSubject(subject.id)}
                    >
                      Delete
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">{subject.description}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                  <div>
                    <div className="font-medium text-gray-900">{user.full_name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-xs text-gray-500 mt-1">Role: <span className="font-medium">{user.role}</span></div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <select
                      value={user.role}
                      onChange={async (e) => {
                        const newRole = e.target.value as 'student' | 'faculty' | 'admin';
                        if (!confirm(`Change role of ${user.full_name} to ${newRole}?`)) return;
                        try {
                          const { error } = await (supabase.from('profiles') as any).update({ role: newRole }).eq('id', user.id);
                          if (error) throw error;
                          loadData();
                        } catch (err) {
                          console.error('Error changing role:', err);
                          alert('Failed to change role');
                        }
                      }}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >

                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Admin</option>
                    </select>

                    <button
                      className="text-red-600 text-sm"
                      onClick={async () => {
                        if (!confirm(`Delete user ${user.full_name}? This will remove their profile.`)) return;
                        try {
                          const { error } = await (supabase.from('profiles') as any).delete().eq('id', user.id);
                          if (error) throw error;
                          loadData();
                        } catch (err) {
                          console.error('Error deleting user:', err);
                          alert('Failed to delete user');
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <Modal
        isOpen={showAddSubjectModal}
        onClose={() => setShowAddSubjectModal(false)}
        title="Add New Subject"
      >
        <form onSubmit={handleAddSubject} className="space-y-4">
          <Input
            label="Subject Name"
            placeholder="e.g., Data Structures"
            value={newSubject.name}
            onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
            required
          />

          <Textarea
            label="Description"
            placeholder="Brief description of the subject"
            value={newSubject.description}
            onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
            rows={3}
            required
          />

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowAddSubjectModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Subject</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
