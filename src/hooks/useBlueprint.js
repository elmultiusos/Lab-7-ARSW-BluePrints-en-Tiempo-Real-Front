import { useState, useEffect, useRef } from 'react';
import { BlueprintService } from '../services/api/blueprint.service.js';
import { log } from '../utils/logger.js';

const blueprintService = new BlueprintService();

export function useBlueprints(author, tech, isAuthenticated) {
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const loadBlueprints = async () => {
    if (!isAuthenticated || !author) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await blueprintService.getAllByAuthor(author, tech);
      setBlueprints(data);
    } catch (err) {
      setError(err.message);
      log.error('Error loading blueprints', err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadBlueprints();
  }, [author, tech, isAuthenticated]);
  
  return { blueprints, loading, error, reload: loadBlueprints };
}

export function useBlueprint(author, name, tech, isAuthenticated) {
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const loadBlueprint = async () => {
    if (!isAuthenticated || !author || !name) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await blueprintService.getByAuthorAndName(author, name, tech);
      setBlueprint(data);
    } catch (err) {
      setError(err.message);
      log.error('Error loading blueprint', err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadBlueprint();
  }, [author, name, tech, isAuthenticated]);
  
  const updateBlueprint = (newBlueprint) => {
    setBlueprint(newBlueprint);
  };
  
  const addPoint = (point) => {
    setBlueprint(prev => ({
      ...prev,
      points: [...(prev?.points || []), point]
    }));
  };
  
  return { blueprint, loading, error, reload: loadBlueprint, updateBlueprint, addPoint };
}
