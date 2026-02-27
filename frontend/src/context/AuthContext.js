import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Log API configuration on mount
if (typeof window !== 'undefined') {
  console.log('🌐 API URL configured as:', API);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ms_token'));
  const [loading, setLoading] = useState(true);
  const [isIncognito, setIsIncognito] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const res = await axios.get(`${API}/user/profile`);
          setUser(res.data);
        } catch {
          localStorage.removeItem('ms_token');
          delete axios.defaults.headers.common['Authorization'];
          setToken(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    initializeAuth();
  }, [token]);

  const login = async (username, password) => {
    try {
      const res = await axios.post(`${API}/auth/login`, { username, password });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('ms_token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login request failed:', error.message, 'API URL:', API);
      throw error;
    }
  };

  const register = async (formData) => {
    try {
      const res = await axios.post(`${API}/auth/register`, formData);
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('ms_token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Registration request failed:', error.message, 'API URL:', API);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('ms_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setIsIncognito(false);
  };

  const toggleIncognito = () => setIsIncognito(prev => !prev);

  return (
    <AuthContext.Provider value={{ user, token, loading, isIncognito, login, register, logout, toggleIncognito }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);