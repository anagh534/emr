import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../services/authApi';

// Query keys constants
export const AUTH_KEYS = {
  user: ['auth', 'user'],
};

/**
 * Hook to retrieve and observe the current authenticated user.
 * It is enabled only when a token is present in localStorage.
 */
export function useCurrentUser() {
  const token = localStorage.getItem('accessToken');
  
  return useQuery({
    queryKey: AUTH_KEYS.user,
    queryFn: async () => {
      try {
        const response = await authApi.getMe();
        return response.data.user;
      } catch (error) {
        // If the profile fetch fails, clean up locally
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        throw error;
      }
    },
    enabled: !!token,
    retry: false, // Don't retry on unauthorized profile fetch
    staleTime: 1000 * 60 * 15, // Keep cache fresh for 15 mins
  });
}

/**
 * Hook to login a user.
 * On success, saves JWT tokens and updates query cache with user data.
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
    onSuccess: (response) => {
      const { accessToken, refreshToken, user } = response.data || {};
      
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Update the user details in React Query cache
      queryClient.setQueryData(AUTH_KEYS.user, user);
    },
  });
}

/**
 * Hook to register a user.
 * On success, saves JWT tokens and updates query cache with user data.
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData) => authApi.register(userData),
    onSuccess: (response) => {
      const { accessToken, refreshToken, user } = response.data || {};
      
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Update the user details in React Query cache
      queryClient.setQueryData(AUTH_KEYS.user, user);
    },
  });
}

/**
 * Hook to log out the user.
 * Invalidate refresh token on server, clears React Query cache, and removes local tokens.
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        return authApi.logout(refreshToken);
      }
      return Promise.resolve();
    },
    // Run client side cleanup regardless of server success/failure
    onSettled: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Reset all query states (especially auth/user cache)
      queryClient.setQueryData(AUTH_KEYS.user, null);
      queryClient.clear();
    },
  });
}

/**
 * Hook for Super Admin to create new staff accounts (Doctors, Receptionists).
 * Does not overwrite current admin session tokens.
 */
export function useCreateStaff() {
  return useMutation({
    mutationFn: (staffData) => authApi.register(staffData),
  });
}
