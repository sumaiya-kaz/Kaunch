import api from './api';

export const fineService = {
  async getAllFines(month, year) {
    try {
      const response = await api.get('/fines', {
        params: { month, year },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch fines',
      };
    }
  },

  async getMyFines() {
    try {
      const response = await api.get('/fines/my');
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch fines',
      };
    }
  },

  async updateFineStatus(fineId, status, notes) {
    try {
      const response = await api.put(`/fines/${fineId}/status`, { status, notes });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed',
      };
    }
  },

  async createFine(employeeId, date, amount, reason) {
    try {
      const response = await api.post('/fines', {
        employee_id: employeeId,
        date,
        amount,
        reason,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create fine',
      };
    }
  },

  async getMonthlyStats(month, year) {
    try {
      const response = await api.get('/fines/stats', {
        params: { month, year },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch stats',
      };
    }
  },

  async getDailyFines(date) {
    try {
      const response = await api.get('/fines/daily', { params: { date } });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch daily fines',
      };
    }
  },

  async generateFinesFromSheet(date, amount) {
    try {
      const response = await api.post('/fines/generate', { date, amount });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to generate fines',
      };
    }
  },
};
