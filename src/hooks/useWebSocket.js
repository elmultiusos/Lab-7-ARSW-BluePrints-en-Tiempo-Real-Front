import { useState, useEffect, useRef } from 'react';
import { createSocket } from '../lib/socketIoClient.js';
import { createStompClient, subscribeBlueprint } from '../lib/stompClient.js';
import { getToken } from '../utils/auth.js';
import { log } from '../utils/logger.js';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080';
const IO_BASE = import.meta.env.VITE_IO_BASE ?? 'http://localhost:3001';

export function useWebSocket(tech, author, name, isAuthenticated, onBlueprintUpdate, onBlueprintsListUpdate) {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const socketRef = useRef(null);
  const stompRef = useRef(null);
  const unsubRef = useRef(null);
  
  useEffect(() => {
    if (!isAuthenticated || !author || !name) {
      cleanup();
      return;
    }
    
    if (tech === 'stomp') {
      setupStomp();
    } else {
      setupSocketIO();
    }
    
    return cleanup;
  }, [tech, author, name, isAuthenticated]);
  
  const setupSocketIO = () => {
    log.info('Initializing Socket.IO connection', { server: IO_BASE });
    setConnectionStatus('connecting');
    
    const token = getToken();
    const socket = createSocket(IO_BASE, token);
    socketRef.current = socket;
    
    const room = `blueprints.${author}.${name}`;
    
    socket.on('connect', () => {
      setConnectionStatus('connected');
      log.success('Socket.IO connected', { socketId: socket.id });
      socket.emit('join-room', room);
      log.socket(`Joining room: ${room}`);
    });
    
    socket.on('disconnect', (reason) => {
      setConnectionStatus('disconnected');
      log.warn('Socket.IO disconnected', { reason });
    });
    
    socket.on('connect_error', (error) => {
      setConnectionStatus('error');
      log.error('Socket.IO connection error', error.message);
    });
    
    socket.on('blueprint-update', (data) => {
      log.socket('Received blueprint-update', { author: data.author, name: data.name, points: data.points.length });
      onBlueprintUpdate?.(data);
    });
    
    socket.on('blueprints-list-update', (data) => {
      if (data.author === author) {
        log.socket('Received blueprints-list-update', { author: data.author });
        onBlueprintsListUpdate?.();
      }
    });
    
    socket.on('error', (error) => {
      log.error('Socket error', error);
    });
  };
  
  const setupStomp = () => {
    log.info('Initializing STOMP connection', { server: API_BASE });
    setConnectionStatus('connecting');
    
    const client = createStompClient(API_BASE);
    stompRef.current = client;
    
    client.onConnect = () => {
      setConnectionStatus('connected');
      log.success('STOMP connected');
      
      unsubRef.current = subscribeBlueprint(client, author, name, (data) => {
        log.socket('Received blueprint update via STOMP', { points: data.points.length });
        onBlueprintUpdate?.(data);
      });
    };
    
    client.onDisconnect = () => {
      setConnectionStatus('disconnected');
      log.warn('STOMP disconnected');
    };
    
    client.activate();
  };
  
  const cleanup = () => {
    log.info('Cleaning up WebSocket connections');
    unsubRef.current?.();
    unsubRef.current = null;
    stompRef.current?.deactivate?.();
    stompRef.current = null;
    socketRef.current?.disconnect?.();
    socketRef.current = null;
    setConnectionStatus('disconnected');
  };
  
  const sendDrawEvent = (point) => {
    if (tech === 'stomp' && stompRef.current?.connected) {
      stompRef.current.publish({
        destination: '/app/draw',
        body: JSON.stringify({ author, name, point })
      });
      log.socket('Sent draw-event via STOMP', { point });
    } else if (tech === 'socketio' && socketRef.current?.connected) {
      const room = `blueprints.${author}.${name}`;
      socketRef.current.emit('draw-event', { room, author, name, point });
      log.socket('Sent draw-event via Socket.IO', { room, point });
    }
  };
  
  return { connectionStatus, sendDrawEvent };
}
