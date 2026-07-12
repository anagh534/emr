import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi } from '../services/patientApi';

/**
 * Hook to execute patient queries on Name, ID, or Contact.
 */
export function useSearchPatientsQuery(query, options = {}) {
  return useQuery({
    queryKey: ['patients', 'search', query],
    queryFn: () => patientApi.searchPatients(query),
    enabled: !!query && query.trim().length > 0,
    ...options
  });
}

/**
 * Hook to register new patients.
 */
export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientData) => patientApi.createPatient(patientData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    }
  });
}
