import { api } from '../../../lib/axios';

export const patientApi = {
  /**
   * Search patients by Name, ID, or Phone
   * @param {string} query
   */
  searchPatients: async (query, limit = 5, offset = 0) => {
    const response = await api.get('/patients', { params: { query, limit, offset } });
    return response.data;
  },

  /**
   * Create a new patient profile manually
   * @param {Object} patientData
   */
  createPatient: async (patientData) => {
    const response = await api.post('/patients', patientData);
    return response.data;
  }
};
