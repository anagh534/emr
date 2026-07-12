import { api } from '../../../lib/axios';

export const patientApi = {
  /**
   * Search patients by Name, ID, or Phone
   * @param {string} query
   */
  searchPatients: async (query) => {
    const response = await api.get('/patients', { params: { query } });
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
