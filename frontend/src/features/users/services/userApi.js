import { api } from '../../../lib/axios';

/**
 * User Management API Service
 */
export const userApi = {
  /**
   * Fetch paginated list of clinic staff
   * @param {Object} params - { limit, offset }
   */
  getUsers: async ({ limit = 5, offset = 0 } = {}) => {
    const response = await api.get('/users', {
      params: { limit, offset },
    });
    return response.data;
  },

  /**
   * Toggle user active/inactive state
   * @param {string} id - User ID
   * @param {boolean} isActive - New status
   */
  toggleUserStatus: async (id, isActive) => {
    const response = await api.patch(`/users/${id}/status`, { isActive });
    return response.data;
  },

  /**
   * Delete user account
   * @param {string} id - User ID
   */
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  /**
   * Change user password by Admin
   * @param {string} id - User ID
   * @param {string} password - New password
   */
  changePassword: async (id, password) => {
    const response = await api.patch(`/users/${id}/password`, { password });
    return response.data;
  },
};
