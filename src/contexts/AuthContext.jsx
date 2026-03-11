import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('academicUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on mount to restore user session
    const saved = localStorage.getItem('academicUser');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem('academicUser');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('academicUser', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('academicUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
