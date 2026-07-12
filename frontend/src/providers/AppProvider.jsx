import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '../lib/react-query';
import { ToastProvider } from '../context/ToastContext';
import { io } from 'socket.io-client';

/**
 * AppProvider wrapper that registers global context providers:
 * - TanStack QueryClientProvider
 * - ToastProvider
 * - Socket.IO client connections to trigger real-time UI query invalidations
 */
export function AppProvider({ children }) {
  useEffect(() => {
    const handleGlobalLogout = () => {
      // Clear React Query cache on forced logout
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.clear();
    };

    window.addEventListener('auth:logout', handleGlobalLogout);

    // Initialize Socket.IO connection
    const socketUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:5000'; // Default port is 5000

    const socket = io(socketUrl);

    const handleRealtimeUpdate = () => {
      // Invalidate active appointment query registers to reload scheduler list instantly
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    };

    socket.on('appointment:created', handleRealtimeUpdate);
    socket.on('appointment:updated', handleRealtimeUpdate);
    socket.on('appointment:cancelled', handleRealtimeUpdate);

    return () => {
      window.removeEventListener('auth:logout', handleGlobalLogout);
      socket.off('appointment:created', handleRealtimeUpdate);
      socket.off('appointment:updated', handleRealtimeUpdate);
      socket.off('appointment:cancelled', handleRealtimeUpdate);
      socket.disconnect();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {children}
      </ToastProvider>
      {/* Devtools will only be included in development builds */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
}
