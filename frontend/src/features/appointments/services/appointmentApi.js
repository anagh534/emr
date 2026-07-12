import { api } from '../../../lib/axios';

export const appointmentApi = {
  /**
   * Fetch paginated, sorted, and filtered appointments from the backend
   */
  getAppointments: async ({
    limit = 5,
    offset = 0,
    sortBy = 'date',
    sortOrder = 'asc',
    patientSearch = '',
    doctorSearch = '',
    mobileSearch = '',
    department = 'All',
    status = 'All',
    startDate = '',
    endDate = ''
  } = {}) => {
    const response = await api.get('/appointments', {
      params: {
        limit,
        offset,
        sortBy,
        sortOrder,
        patientSearch,
        doctorSearch,
        mobileSearch,
        department,
        status,
        startDate,
        endDate
      }
    });
    return response.data;
  },

  /**
   * Book a new clinical appointment
   */
  createAppointment: async (apptData) => {
    const response = await api.post('/appointments', apptData);
    return response.data;
  },

  /**
   * Update appointment details, notes, and status workflows
   */
  updateAppointment: async (id, updateData) => {
    const response = await api.patch(`/appointments/${id}`, updateData);
    return response.data;
  }
};
