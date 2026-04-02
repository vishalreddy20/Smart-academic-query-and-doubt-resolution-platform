import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, LogOut, LogIn, UserPlus, User, Crown, LayoutDashboard, ChevronDown, Bell, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
    setMobileOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'student') return '/student';
    if (user.role === 'tutor') return '/tutor';
    if (user.role === 'admin') return '/admin';
    return '/';
  };

  const roleTheme = {
    student: { bg: 'bg-blue-600', text: 'Student', color: 'text-blue-600' },
    tutor: { bg: 'bg-emerald-600', text: 'Tutor', color: 'text-emerald-600' },
    admin: { bg: 'bg-purple-600', text: 'Admin', color: 'text-purple-600' },
  };
  const theme = roleTheme[user?.role] || { bg: 'bg-indigo-600', text: '', color: 'text-indigo-600' };

  const navLinks = [
    { to: '/knowledge-base', label: 'Knowledge Base', public: true },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-indigo-200 transition-shadow">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-slate-900 leading-none block">Smart Doubts</span>
              <span className="text-xs text-slate-400 leading-none">Academic Platform</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  location.pathname === link.to
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* Dashboard Button */}
                {getDashboardLink() && (
                  <Link
                    to={getDashboardLink()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition shadow-sm ${theme.bg} hover:opacity-90`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}

                {/* User Menu Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                  >
                    {/* Avatar */}
                    <div className={`w-7 h-7 ${theme.bg} rounded-lg flex items-center justify-center text-white text-sm font-bold`}>
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-900 leading-none">{user.name?.split(' ')[0]}</p>
                      <p className="text-xs text-slate-400 capitalize leading-none mt-0.5">{user.role}</p>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Profile
                      </Link>
                      {user.role === 'student' && (
                        <Link
                          to="/subscription"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Crown className="w-4 h-4 text-amber-400" />
                          Subscription
                        </Link>
                      )}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:text-indigo-600 font-medium transition"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 font-semibold transition shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="px-4 py-4 space-y-1">
            <Link to="/knowledge-base" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
              Knowledge Base
            </Link>
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                  My Profile
                </Link>
                {user.role === 'student' && (
                  <Link to="/subscription" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Subscription
                  </Link>
                )}
                {getDashboardLink() && (
                  <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)} className={`block px-4 py-3 rounded-xl text-sm font-semibold text-white ${theme.bg}`}>
                    Dashboard
                  </Link>
                )}
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-700">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
