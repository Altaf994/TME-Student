import axios from 'axios';
import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from 'react';
import { apiService } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem(process.env.REACT_APP_AUTH_TOKEN_KEY);
    localStorage.removeItem(process.env.REACT_APP_REFRESH_TOKEN_KEY);
    setUser(null);
    setError(null);
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem(process.env.REACT_APP_AUTH_TOKEN_KEY);
      if (token) {
        const response = await apiService.get('/auth/me');
        setUser(response.data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async credentials => {
    setLoading(true);
    setError(null);

    try {
      // Use correct endpoint, no trailing slash, and /v1 included
      const response = await axios.post(
        'http://localhost:3000/api/v1/auth/login',
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const { token, refresh_token, user: userData, teacherId } = response.data;

      console.log('Access Token:', token);
      localStorage.setItem(process.env.REACT_APP_AUTH_TOKEN_KEY, token);
      if (refresh_token) {
        localStorage.setItem(
          process.env.REACT_APP_REFRESH_TOKEN_KEY,
          refresh_token
        );
      }

      // Set user info if available, else fallback to username only
      setUser(userData || { username: credentials.username, teacherId });
      return { success: true };
    } catch (apiError) {
      console.warn('API login failed:', apiError);

      // Fallback for hardcoded dev credentials
      const { username, password } = credentials;
      if (username === 'KarimJindani@gmail.com' && password === 'Test123') {
        setUser({
          username,
          student_id: 'STU001',
          id: 'STU001',
          name: 'Karim Jindani',
        });
        setError(null);
        return { success: true };
      } else {
        const errorMessage =
          apiError.response?.data?.message || 'Invalid username or password';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async profileData => {
    setLoading(true);
    try {
      const response = await apiService.put('/auth/profile', profileData);
      setUser(response.data);
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
