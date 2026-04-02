import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function SidebarNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const role = user?.role || 'student';
  const navByRole = {
    student: [
      { id: 'queries', icon: 'menu_book', label: 'My Queries', path: '/student' },
      { id: 'knowledge', icon: 'auto_stories', label: 'Knowledge Base', path: '/knowledge-base' },
      { id: 'post', icon: 'edit_note', label: 'Post Doubt', path: '/post-doubt' },
      { id: 'subscription', icon: 'workspace_premium', label: 'Subscription', path: '/subscription' },
    ],
    tutor: [
      { id: 'queue', icon: 'reorder', label: 'Faculty Queue', path: '/tutor' },
      { id: 'knowledge', icon: 'auto_stories', label: 'Knowledge Base', path: '/knowledge-base' },
      { id: 'profile', icon: 'person', label: 'Profile', path: '/profile' },
    ],
    admin: [
      { id: 'overview', icon: 'dashboard', label: 'Overview', path: '/admin' },
      { id: 'moderation', icon: 'gavel', label: 'Moderation', path: '/admin' },
      { id: 'users', icon: 'analytics', label: 'User Analytics', path: '/admin' },
      { id: 'knowledge', icon: 'library_books', label: 'Knowledge Index', path: '/knowledge-base' },
      { id: 'health', icon: 'monitoring', label: 'System Health', path: '/admin' },
    ],
  };

  const navItems = navByRole[role] || navByRole.student;

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handlePrimaryAction = () => {
    if (role === 'student') navigate('/post-doubt');
    else if (role === 'tutor') navigate('/tutor');
    else navigate('/admin');
  };

  const panelTitle = role === 'admin' ? 'Curator Panel' : 'The Curator';
  const panelSubtitle = role === 'admin' ? 'Editorial Authority' : 'Academic Intelligence';
  const primaryActionLabel = role === 'student' ? 'Post New Doubt' : role === 'tutor' ? 'Open Queue' : 'New Query';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="h-screen w-72 fixed left-0 bg-surface-container-low dark:bg-primary-container flex flex-col p-6 gap-8 z-40 hidden md:flex border-r border-outline-variant/10">
      {/* Branding */}
      <div className="flex flex-col gap-1">
        <span className="font-headline text-xl font-bold text-primary dark:text-surface">{panelTitle}</span>
        <span className="text-xs uppercase tracking-widest text-on-surface-variant font-medium">{panelSubtitle}</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
              isActive(item.path)
                ? 'bg-surface-container-lowest text-secondary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base" style={{ fontSize: '20px' }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto flex flex-col gap-4">
        {/* Post Doubt Button */}
        <button
          onClick={handlePrimaryAction}
          className="w-full btn-primary py-3 text-sm font-medium flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            add
          </span>
          {primaryActionLabel}
        </button>

        {/* Support & Logout */}
        <div className="pt-4 border-t border-outline-variant/20 flex flex-col gap-2">
          <button
            disabled
            className="flex items-center gap-3 px-2 py-2 text-on-surface-variant hover:bg-surface-container rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
          >
            <span className="material-symbols-outlined text-base">help</span>
            <span>Support</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-2 py-2 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-lg text-sm font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
