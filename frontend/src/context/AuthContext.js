import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('mediconnect_token');
    const storedUser = localStorage.getItem('mediconnect_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (authData) => {
    setToken(authData.token);
    const userData = {
      userId: authData.userId,
      email: authData.email,
      firstName: authData.firstName,
      lastName: authData.lastName,
      role: authData.role,
      profileId: authData.profileId,
    };
    setUser(userData);
    localStorage.setItem('mediconnect_token', authData.token);
    localStorage.setItem('mediconnect_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('mediconnect_token');
    localStorage.removeItem('mediconnect_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
