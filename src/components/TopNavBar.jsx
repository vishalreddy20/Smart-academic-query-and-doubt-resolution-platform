import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ROLE_NAV = {
  student: [
    { label: 'Dashboard', path: '/student' },
    { label: 'Knowledge Base', path: '/knowledge-base' },
    { label: 'Post Doubt', path: '/post-doubt' },
  ],
  tutor: [
    { label: 'Faculty Queue', path: '/tutor' },
    { label: 'Knowledge Base', path: '/knowledge-base' },
    { label: 'Profile', path: '/profile' },
  ],
  admin: [
    { label: 'Overview', path: '/admin' },
    { label: 'Knowledge Base', path: '/knowledge-base' },
    { label: 'Profile', path: '/profile' },
  ],
};

export default function TopNavBar({
  title = 'The Academic Curator',
  navItems,
  activePath,
  withSidebar = false,
  showSearch = true,
  searchPlaceholder = 'Search insights...',
  onSearch,
}) {
  const { user } = useAuth();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const resolvedNavItems = navItems || ROLE_NAV[user?.role] || [{ label: 'Knowledge Base', path: '/knowledge-base' }];

  const isActive = (path) => {
    const current = activePath || location.pathname;
    if (path === '/') return current === '/';
    return current === path || current.startsWith(`${path}/`);
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
      return;
    }
    console.log('Search:', searchQuery);
  };

  return (
    <header className="fixed top-0 w-full z-30 bg-surface/80 dark:bg-primary-container/80 backdrop-blur-xl shadow-[0px_20px_40px_rgba(15,23,42,0.06)] border-b border-outline-variant/10">
      <div className={`flex justify-between items-center px-6 md:px-10 py-4 max-w-[1440px] mx-auto ${withSidebar ? 'md:ml-72' : ''}`}>
        {/* Left Section: Title & Navigation */}
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-headline italic text-primary dark:text-surface leading-none hidden md:block">
            {title}
          </h1>
          <nav className="hidden lg:flex items-center gap-6 font-headline tracking-tight">
            {resolvedNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={isActive(item.path)
                  ? 'text-secondary font-semibold border-b-2 border-secondary pb-1 text-sm'
                  : 'text-on-surface-variant font-medium hover:text-secondary transition-colors text-sm pb-1'}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Section: Search, Icons, Profile */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          {showSearch && (
            <div className="relative hidden sm:block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-base">
              search
            </span>
            <input
              className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all w-48 lg:w-64"
              placeholder={searchPlaceholder}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
            </div>
          )}

          {/* Icon Buttons */}
          <div className="flex items-center gap-2">
            <button className="p-2.5 text-on-surface-variant hover:bg-surface-container-low hover:text-secondary rounded-lg transition-all">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                notifications
              </span>
            </button>
            <button className="p-2.5 text-on-surface-variant hover:bg-surface-container-low hover:text-secondary rounded-lg transition-all">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                settings
              </span>
            </button>

            {/* Profile Avatar */}
            <div className="h-10 w-10 rounded-full overflow-hidden ml-2 border-2 border-outline-variant/30 bg-surface-container flex items-center justify-center text-primary font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
