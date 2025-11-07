import { getToken } from '../../utils/auth.js';
import { log } from '../../utils/logger.js';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080'; // Spring
const IO_BASE = import.meta.env.VITE_IO_BASE ?? 'http://localhost:3001'; // Node/Socket.IO

export class BlueprintService {
  async getAllByAuthor(author, tech = 'socketio') {
    const baseUrl = tech === 'stomp' ? API_BASE : IO_BASE;
    const token = getToken();
    
    try {
      const response = await fetch(`${baseUrl}/api/blueprints/${author}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('AUTH_ERROR');
        }
        throw new Error('Failed to fetch blueprints');
      }
      
      const data = await response.json();
      log.success(`Loaded ${data.length} blueprints for ${author}`);
      return data;
    } catch (error) {
      log.error('Error loading blueprints list', error.message);
      throw error;
    }
  }
  
  async getByAuthorAndName(author, name, tech = 'socketio') {
    const baseUrl = tech === 'stomp' ? API_BASE : IO_BASE;
    const token = getToken();
    
    try {
      const response = await fetch(`${baseUrl}/api/blueprints/${author}/${name}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('AUTH_ERROR');
        }
        throw new Error('Failed to fetch blueprint');
      }
      
      const data = await response.json();
      log.success(`Blueprint loaded: ${author}/${name}`, { points: data.points?.length || 0 });
      return data;
    } catch (error) {
      log.error('Error loading blueprint', error.message);
      throw error;
    }
  }
  
  async create(author, name, points = [], tech = 'socketio') {
    const baseUrl = tech === 'stomp' ? API_BASE : IO_BASE;
    const token = getToken();
    
    try {
      const response = await fetch(`${baseUrl}/api/blueprints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ author, name, points })
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('AUTH_ERROR');
        }
        const error = await response.json();
        throw new Error(error.error || 'Failed to create blueprint');
      }
      
      const data = await response.json();
      log.success(`Blueprint created: ${author}/${name}`);
      return data;
    } catch (error) {
      log.error('Error creating blueprint', error.message);
      throw error;
    }
  }
  
  async update(author, name, points, tech = 'socketio') {
    const baseUrl = tech === 'stomp' ? API_BASE : IO_BASE;
    const token = getToken();
    
    try {
      const response = await fetch(`${baseUrl}/api/blueprints/${author}/${name}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ points })
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('AUTH_ERROR');
        }
        throw new Error('Failed to save blueprint');
      }
      
      const data = await response.json();
      log.success(`Blueprint saved: ${author}/${name}`, { points: points.length });
      return data;
    } catch (error) {
      log.error('Error saving blueprint', error.message);
      throw error;
    }
  }
  
  async delete(author, name, tech = 'socketio') {
    const baseUrl = tech === 'stomp' ? API_BASE : IO_BASE;
    const token = getToken();
    
    try {
      const response = await fetch(`${baseUrl}/api/blueprints/${author}/${name}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('AUTH_ERROR');
        }
        throw new Error('Failed to delete blueprint');
      }
      
      log.success(`Blueprint deleted: ${author}/${name}`);
      return true;
    } catch (error) {
      log.error('Error deleting blueprint', error.message);
      throw error;
    }
  }
}
