import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // For now, we'll implement a simple session check
      // In a real app, this would check with your auth service
      const token = localStorage.getItem('auth_token');
      if (token) {
        setIsAuthenticated(true);
        setUser({ id: '1', name: 'User' });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // Mock login - replace with actual authentication
      const { username, password } = credentials;
      
      if (username && password) {
        const token = 'mock_token_' + Date.now();
        localStorage.setItem('auth_token', token);
        setIsAuthenticated(true);
        setUser({ id: '1', name: username });
        return { success: true };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
