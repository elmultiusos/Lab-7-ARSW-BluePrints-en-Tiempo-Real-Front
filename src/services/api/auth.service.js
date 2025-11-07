import { getToken } from '../../utils/auth.js';
import { log } from '../../utils/logger.js';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080'; // Spring
const IO_BASE = import.meta.env.VITE_IO_BASE ?? 'http://localhost:3001'; // Node/Socket.IO

export class AuthService {
  async register(username, password, tech = 'socketio') {
    const baseUrl = tech === 'stomp' ? API_BASE : IO_BASE;
    
    try {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      log.success('Registration successful', data.user);
      return data;
    } catch (error) {
      log.error('Registration error', error.message);
      throw error;
    }
  }
  
  async login(username, password, tech = 'socketio') {
    const baseUrl = tech === 'stomp' ? API_BASE : IO_BASE;
    
    try {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      log.success('Login successful', data.user);
      return data;
    } catch (error) {
      log.error('Login error', error.message);
      throw error;
    }
  }
  
  async verifyToken(tech = 'socketio') {
    const baseUrl = tech === 'stomp' ? API_BASE : IO_BASE;
    const token = getToken();
    
    if (!token) {
      throw new Error('No token found');
    }
    
    try {
      const response = await fetch(`${baseUrl}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Token verification failed');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      log.error('Token verification error', error.message);
      throw error;
    }
  }
}
