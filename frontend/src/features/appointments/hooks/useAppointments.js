import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { appointmentApi } from '../services/appointmentApi';

export const APPOINTMENT_KEYS = {
  all: () => ['appointments'],
  list: (params) => ['appointments', 'list', params],
};

/**
 * Hook to retrieve a paginated, filtered, and sorted list of appointments.
 * Uses keepPreviousData for smooth loading states on filters/pagination.
 */
export function useAppointmentsQuery(params = {}) {
  return useQuery({
    queryKey: APPOINTMENT_KEYS.list(params),
    queryFn: () => appointmentApi.getAppointments(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}

/**
 * Hook to book a new appointment.
 * Automatically invalidates active query lists so the registry updates immediately.
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (apptData) => appointmentApi.createAppointment(apptData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENT_KEYS.all() });
    }
  });
}

/**
 * Hook to modify appointment details, notes, and statuses.
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updateData }) => appointmentApi.updateAppointment(id, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENT_KEYS.all() });
    }
  });
}
