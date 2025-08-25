import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};


export const WebSocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuth();
  const eventHandlersRef = useRef(new Map());

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    socketRef.current = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000', {
      auth: {
        token: token
      }
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      
      if (user) {
        socketRef.current.emit('joinUser', user._id);
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    socketRef.current.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Set up listeners for all registered events
    eventHandlersRef.current.forEach((handlers, event) => {
      handlers.forEach(handler => {
        socketRef.current.on(event, handler);
      });
    });
  }, [token, user]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const subscribe = useCallback((event, handler) => {
    if (!eventHandlersRef.current.has(event)) {
      eventHandlersRef.current.set(event, new Set());
    }
    eventHandlersRef.current.get(event).add(handler);
    
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  }, []);

  const unsubscribe = useCallback((event, handler) => {
    if (eventHandlersRef.current.has(event)) {
      eventHandlersRef.current.get(event).delete(handler);
      
      if (socketRef.current) {
        socketRef.current.off(event, handler);
      }
    }
  }, []);

  const emit = useCallback((event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  }, []);

  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  const value = {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    emit
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};