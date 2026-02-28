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
  const [connectionSpeed, setConnectionSpeed] = useState('unknown'); // 'fast', 'slow', 'very-slow', 'unknown'
  const [manualSlowMode, setManualSlowMode] = useState(localStorage.getItem('manual_slow_mode') === 'true'); // Manual override for slow connections

  // Detect internet connection quality
  useEffect(() => {
    const detectConnection = () => {
      let speed = 'unknown';

      // Method 1: Modern API (navigator.connection) - Chrome, Edge, Opera
      if ('connection' in navigator) {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (conn) {
          const effectiveType = conn.effectiveType;

          if (effectiveType === '4g') {
            speed = 'fast';
          } else if (effectiveType === '3g') {
            speed = 'slow';
          } else if (effectiveType === '2g' || effectiveType === 'slow-2g') {
            speed = 'very-slow';
          }

          console.log(`📡 Method 1 - Connection detected: ${effectiveType} (${conn.downlink?.toFixed(1) || 'N/A'} Mbps)`);
        }
      } else {
        // Method 2: Fallback - Check localStorage for user preference
        const savedPref = localStorage.getItem('connection_speed_pref');
        if (savedPref) {
          speed = savedPref;
          console.log(`📡 Method 2 - Using saved preference: ${speed}`);
        } else {
          // Method 3: Try to detect via performance API
          if ('performance' in window && 'memory' in performance) {
            console.log(`📡 Method 3 - Performance API available`);
          }
          console.log('📡 No connection detection available - set manually if needed');
        }
      }

      setConnectionSpeed(speed);
    };

    detectConnection();

    // Listen for connection changes
    if ('connection' in navigator) {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn) {
        conn.addEventListener('change', detectConnection);
        return () => conn.removeEventListener('change', detectConnection);
      }
    }
  }, []);

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

  // Toggle manual slow mode for users on slow connections
  const toggleSlowMode = () => {
    setManualSlowMode(prev => {
      const newValue = !prev;
      localStorage.setItem('manual_slow_mode', newValue);
      console.log(`🔄 Slow mode toggled: ${newValue ? 'ON' : 'OFF'}`);
      return newValue;
    });
  };

  // Determine effective connection speed (auto-detected or manual)
  const effectiveConnectionSpeed = manualSlowMode ? 'very-slow' : connectionSpeed;

  return (
    <AuthContext.Provider value={{ user, token, loading, isIncognito, login, register, logout, toggleIncognito, connectionSpeed: effectiveConnectionSpeed, toggleSlowMode, manualSlowMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);