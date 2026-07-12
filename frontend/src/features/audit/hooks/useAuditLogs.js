import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../services/auditApi';

/**
 * Fetch paginated list of system logs with caching support
 */
export function useAuditLogsQuery(limit = 10, offset = 0) {
  return useQuery({
    queryKey: ['audit-logs', limit, offset],
    queryFn: () => auditApi.getAuditLogs(limit, offset),
    staleTime: 1000 * 15, // Cache stale after 15s
  });
}
