import api from './api';

export const reportService = {
  async getDashboardStats() {
    try {
      const response = await api.get('/reports/dashboard');
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch stats',
      };
    }
  },

  async getDailyReport(date) {
    try {
      const response = await api.get('/reports/daily', { params: { date } });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch report',
      };
    }
  },

  async getMonthlyReport(month, year) {
    try {
      const response = await api.get('/reports/monthly', {
        params: { month, year },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch report',
      };
    }
  },

  async exportReport(type, params) {
    try {
      const response = await api.get('/reports/export', {
        params: { type, ...params },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Export failed',
      };
    }
  },
};
