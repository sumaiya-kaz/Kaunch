import api from './api';

export const lunchService = {
  async confirmLunch(date, status, notes = '', menuChoice = null) {
    try {
      const response = await api.post('/lunch/confirm', {
        date,
        status,
        notes,
        menu_choice: menuChoice,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Confirmation failed',
      };
    }
  },

  async getTodayConfirmation() {
    try {
      const response = await api.get('/lunch/today');
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch confirmation',
      };
    }
  },

  async getHistory(month, year) {
    try {
      const response = await api.get('/lunch/history', {
        params: { month, year },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch history',
      };
    }
  },

  async getAllTodayConfirmations(date) {
    try {
      const response = await api.get('/lunch/all', { params: { date } });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch confirmations',
      };
    }
  },

  async getPendingConfirmations(date) {
    try {
      const response = await api.get('/lunch/pending', { params: { date } });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch pending',
      };
    }
  },

  async getStats(startDate, endDate) {
    try {
      const response = await api.get('/lunch/stats', {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch stats',
      };
    }
  },

  async getDailySheet(date) {
    try {
      const response = await api.get('/lunch/sheet', { params: { date } });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch daily sheet',
      };
    }
  },

  async saveDailySheet(date, entries) {
    try {
      const response = await api.post('/lunch/sheet', { date, entries });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save daily sheet',
      };
    }
  },
};
