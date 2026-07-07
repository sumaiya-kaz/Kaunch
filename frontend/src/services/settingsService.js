import api from './api';

export const settingsService = {
  async getCutoff() {
    try {
      const response = await api.get('/settings/cutoff');
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch cutoff time',
      };
    }
  },

  async updateCutoff(cutoffTime) {
    try {
      const response = await api.put('/settings/cutoff', { cutoffTime });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update cutoff time',
      };
    }
  },
};
