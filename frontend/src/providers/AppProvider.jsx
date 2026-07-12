import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '../lib/react-query';

/**
 * AppProvider wrapper that registers global context providers:
 * - TanStack QueryClientProvider
 * - React Query Devtools (hidden by default, accessible in development)
 * - Handles global auth logout events to clear queries
 */
export function AppProvider({ children }) {
  useEffect(() => {
    const handleGlobalLogout = () => {
      // Clear React Query cache on forced logout (e.g. token expired)
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.clear();
    };

    window.addEventListener('auth:logout', handleGlobalLogout);
    return () => {
      window.removeEventListener('auth:logout', handleGlobalLogout);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools will only be included in development builds */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
}
