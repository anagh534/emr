import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi } from '../services/patientApi';

/**
 * Hook to execute patient queries on Name, ID, or Contact.
 */
export function useSearchPatientsQuery(query = '', limit = 5, offset = 0, options = {}) {
  return useQuery({
    queryKey: ['patients', 'search', query, limit, offset],
    queryFn: () => patientApi.searchPatients(query, limit, offset),
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
