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

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async credentials => {
    try {
      setLoading(true);
      setError(null);

      // Try API login first
      try {
        const response = await apiService.post('/auth/login', credentials);
        const { accessToken, refreshToken, user: userData } = response.data;

        localStorage.setItem(process.env.REACT_APP_AUTH_TOKEN_KEY, accessToken);
        localStorage.setItem(
          process.env.REACT_APP_REFRESH_TOKEN_KEY,
          refreshToken
        );

        setUser(userData);
        return { success: true };
      } catch (apiError) {
        console.warn('API login failed, trying fallback:', apiError);

        // Fallback to hardcoded credentials for development
        const { email, password } = credentials;
        if (email === 'KarimJindani@gmail.com' && password === 'Test123') {
          setUser({
            email,
            student_id: 'STU001',
            id: 'STU001',
            name: 'Karim Jindani',
          });
          setError(null);
          return { success: true };
        } else {
          setError('Invalid username or password');
          return {
            success: false,
            error: 'Invalid username or password',
          };
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async userData => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.post('/auth/register', userData);
      const { accessToken, refreshToken, user: newUser } = response.data;

      localStorage.setItem(process.env.REACT_APP_AUTH_TOKEN_KEY, accessToken);
      localStorage.setItem(
        process.env.REACT_APP_REFRESH_TOKEN_KEY,
        refreshToken
      );

      setUser(newUser);
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async profileData => {
    try {
      setLoading(true);
      const response = await apiService.put('/auth/profile', profileData);
      setUser(response.data);
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Profile update failed');
      return {
        success: false,
        error: error.response?.data?.message || 'Profile update failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
