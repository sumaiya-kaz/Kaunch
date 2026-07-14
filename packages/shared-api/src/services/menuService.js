import api from './api';

export const menuService = {
  async getTodayOptions() {
    try {
      const response = await api.get('/menu/today/options');
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch menu options',
      };
    }
  },

  async getRange(startDate, endDate) {
    try {
      const response = await api.get('/menu/range', {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch menus',
      };
    }
  },

  async createWeeklyMenu(weekData) {
    try {
      const response = await api.post('/menu/week', weekData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create weekly menu',
      };
    }
  },

  async suggestWeeklyMenu(weekData) {
    try {
      const response = await api.post('/menu/suggest', weekData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to generate menu suggestions',
      };
    }
  },

  async suggestDayMenu(dayData) {
    try {
      const response = await api.post('/menu/suggest/day', dayData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to generate day suggestion',
      };
    }
  },

  async saveWeeklyMenuPlan(planData) {
    try {
      const response = await api.post('/menu/week/plan', planData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save menu plan',
      };
    }
  },

  async updateMenu(id, menuData) {
    try {
      const response = await api.put(`/menu/${id}`, menuData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update menu',
      };
    }
  },

  async deleteMenu(id) {
    try {
      const response = await api.delete(`/menu/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete menu',
      };
    }
  },
};
