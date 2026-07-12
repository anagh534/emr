import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { userApi } from '../services/userApi';

export const USER_KEYS = {
  list: (limit, offset, role, isActive, name, email) => ['users', 'list', { limit, offset, role, isActive, name, email }],
};

/**
 * Hook to retrieve a paginated list of users with applied filters.
 * Uses `keepPreviousData` to ensure page navigation is smooth without loading flickers.
 */
export function useUsersQuery({ limit = 5, offset = 0, role = 'All', isActive = 'All', name = '', email = '' } = {}) {
  return useQuery({
    queryKey: USER_KEYS.list(limit, offset, role, isActive, name, email),
    queryFn: () => userApi.getUsers({ limit, offset, role, isActive, name, email }),
    placeholderData: keepPreviousData, // React Query v5 pagination standard
    staleTime: 1000 * 60 * 2, // 2 minutes stale time
  });
}

/**
 * Hook to toggle user active status (activate/deactivate).
 * Invalidates the users list cache upon successful mutation to refresh UI state.
 */
export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }) => userApi.toggleUserStatus(id, isActive),
    onSuccess: () => {
      // Invalidate all queries matching 'users' to trigger lists refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

/**
 * Hook to delete a user account.
 * Invalidates the users list cache upon successful deletion.
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => userApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

/**
 * Hook to reset a staff member's password by Super Admin.
 */
export function useChangeUserPassword() {
  return useMutation({
    mutationFn: ({ id, password }) => userApi.changePassword(id, password),
  });
}

/**
 * Hook to update a doctor's schedule configuration by Super Admin.
 */
export function useUpdateUserSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, scheduleData }) => userApi.updateSchedule(id, scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
