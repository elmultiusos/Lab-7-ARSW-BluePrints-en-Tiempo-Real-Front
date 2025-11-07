import { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/api/auth.service.js';
import { getToken, setToken, removeToken, getUser, setUser, removeUser } from '../utils/auth.js';
import { log } from '../utils/logger.js';

const AuthContext = createContext();

const authService = new AuthService();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is already authenticated on mount
    const token = getToken();
    const storedUser = getUser();
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUserState(storedUser);
      log.success('User already authenticated', storedUser);
    }
    setLoading(false);
  }, []);
  
  const register = async (username, password, tech) => {
    const data = await authService.register(username, password, tech);
    setToken(data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    setUserState(data.user);
    return data;
  };
  
  const login = async (username, password, tech) => {
    const data = await authService.login(username, password, tech);
    setToken(data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    setUserState(data.user);
    return data;
  };
  
  const logout = () => {
    removeToken();
    removeUser();
    setIsAuthenticated(false);
    setUserState(null);
    log.info('User logged out');
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
