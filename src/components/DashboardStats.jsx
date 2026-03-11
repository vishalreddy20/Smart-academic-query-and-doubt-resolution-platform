import { Users, HelpCircle, CheckCircle, Clock, BookOpen } from 'lucide-react';

export default function DashboardStats({ stats }) {
  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      border: 'border-blue-300',
    },
    {
      label: 'Total Doubts',
      value: stats?.totalDoubts || 0,
      icon: HelpCircle,
      color: 'bg-purple-100 text-purple-600',
      border: 'border-purple-300',
    },
    {
      label: 'Open Doubts',
      value: stats?.openDoubts || 0,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
      border: 'border-yellow-300',
    },
    {
      label: 'Resolved Doubts',
      value: stats?.resolvedDoubts || 0,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
      border: 'border-green-300',
    },
    {
      label: 'Subjects',
      value: stats?.totalSubjects || 0,
      icon: BookOpen,
      color: 'bg-indigo-100 text-indigo-600',
      border: 'border-indigo-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`bg-white p-6 rounded-lg shadow-sm border-2 ${stat.border}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-2">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
