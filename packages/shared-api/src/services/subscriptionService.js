import api from './api';

export const subscriptionService = {
  async createSubscription(subscriptionType, month, year, monthlyFoodChoice) {
    try {
      const response = await api.post('/subscriptions', {
        subscription_type: subscriptionType,
        month,
        year,
        monthly_food_choice: monthlyFoodChoice,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Subscription failed',
      };
    }
  },

  async getMySubscription(month, year) {
    try {
      const response = await api.get('/subscriptions/my', {
        params: { month, year },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch subscription',
      };
    }
  },

  async getAllSubscriptions(month, year) {
    try {
      const response = await api.get('/subscriptions', {
        params: { month, year },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch subscriptions',
      };
    }
  },

  async updateMonthlyFoodChoice(month, year, monthlyFoodChoice) {
    try {
      const response = await api.put('/subscriptions/food-choice', {
        month,
        year,
        monthly_food_choice: monthlyFoodChoice,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update food choice',
      };
    }
  },
};
