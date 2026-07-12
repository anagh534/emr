import { QueryClient } from '@tanstack/react-query';

/**
 * Configure the global TanStack Query Client
 * - staleTime: 5 minutes (data is considered fresh for 5 mins)
 * - gcTime: 10 minutes (unused data is garbage collected after 10 mins)
 * - refetchOnWindowFocus: false (disable automatic refetching on window focus to avoid noise)
 * - retry: 1 (retry failed queries once before showing error UI)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,    // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry for client errors (4xx status codes)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 1;
      },
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});
