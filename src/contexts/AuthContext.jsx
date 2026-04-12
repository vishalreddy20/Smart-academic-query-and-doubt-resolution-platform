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
    const userWithId = { ...userData, id: userData._id || userData.id };
    localStorage.setItem('academicUser', JSON.stringify(userWithId));
    setUser(userWithId);
  };

  const logout = () => {
    localStorage.removeItem('academicUser');
    setUser(null);
  };

  const updateUser = (partial) => {
    setUser((prev) => {
      const updated = { ...prev, ...partial };
      localStorage.setItem('academicUser', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
