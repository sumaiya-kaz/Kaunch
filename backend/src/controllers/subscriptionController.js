import { Subscription } from '../models/subscriptionModel.js';
import { Employee } from '../models/employeeModel.js';
import { normalizeFoodChoice } from '../utils/foodChoice.js';

export const subscriptionController = {
  async createSubscription(req, res) {
    try {
      const { subscription_type, month, year, monthly_food_choice } = req.body;
      const employeeId = req.user.id;

      if (!subscription_type || !month || !year) {
        return res.status(400).json({
          message: 'Subscription type, month, and year are required',
        });
      }

      const employee = await Employee.findById(employeeId);
      const startDate = new Date(year, month - 1, 1);
      let endDate;

      if (subscription_type === 'full') {
        endDate = new Date(year, month, 0);
      } else if (subscription_type === 'half') {
        endDate = new Date(year, month - 1, 15);
      } else {
        return res.status(400).json({ message: 'Invalid subscription type' });
      }

      const subscription = await Subscription.create({
        employee_id: employeeId,
        subscription_type,
        month,
        year,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        monthly_food_choice: normalizeFoodChoice(
          monthly_food_choice || employee.food_preference
        ),
      });

      res.json({
        success: true,
        message: 'Subscription created successfully',
        subscription,
      });
    } catch (error) {
      console.error('Create subscription error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async updateMonthlyFoodChoice(req, res) {
    try {
      const { month, year, monthly_food_choice } = req.body;
      const employeeId = req.user.id;

      if (!month || !year || !monthly_food_choice) {
        return res.status(400).json({
          message: 'Month, year, and monthly food choice are required',
        });
      }

      const subscription = await Subscription.findByEmployeeAndMonth(employeeId, month, year);
      if (!subscription) {
        return res.status(404).json({ message: 'No subscription found for this month' });
      }

      const result = await Subscription.create({
        employee_id: employeeId,
        subscription_type: subscription.subscription_type,
        month,
        year,
        start_date: subscription.start_date,
        end_date: subscription.end_date,
        monthly_food_choice: normalizeFoodChoice(monthly_food_choice),
      });

      res.json({
        success: true,
        message: 'Monthly food choice updated successfully',
        subscription: result,
      });
    } catch (error) {
      console.error('Update monthly food choice error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getMySubscription(req, res) {
    try {
      const { month, year } = req.query;
      const employeeId = req.user.id;

      const currentDate = new Date();
      const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
      const targetYear = year ? parseInt(year) : currentDate.getFullYear();

      const subscription = await Subscription.findByEmployeeAndMonth(
        employeeId,
        targetMonth,
        targetYear
      );
      const employee = await Employee.findById(employeeId);

      res.json({
        success: true,
        subscription: subscription || null,
        defaultFoodChoice: normalizeFoodChoice(employee.food_preference),
      });
    } catch (error) {
      console.error('Get subscription error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getAllSubscriptions(req, res) {
    try {
      const { month, year } = req.query;

      if (month && year) {
        const subscriptions = await Subscription.getActiveSubscriptions(
          parseInt(month),
          parseInt(year)
        );
        return res.json({
          success: true,
          subscriptions,
        });
      }

      const subscriptions = await Subscription.getAll();
      res.json({
        success: true,
        subscriptions,
      });
    } catch (error) {
      console.error('Get all subscriptions error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async deactivateSubscription(req, res) {
    try {
      const { id } = req.params;

      await Subscription.deactivate(id);

      res.json({
        success: true,
        message: 'Subscription deactivated successfully',
      });
    } catch (error) {
      console.error('Deactivate subscription error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
};
