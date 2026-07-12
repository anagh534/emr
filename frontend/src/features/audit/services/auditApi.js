import { api } from '../../../lib/axios';

export const auditApi = {
  /**
   * Retrieve paginated system audit logs (restricted to Super Admin)
   * @param {number} limit
   * @param {number} offset
   */
  getAuditLogs: async (limit = 10, offset = 0) => {
    const response = await api.get('/audit-logs', { params: { limit, offset } });
    return response.data;
  }
};
