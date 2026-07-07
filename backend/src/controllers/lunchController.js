import { LunchConfirmation } from '../models/lunchModel.js';
import { Subscription } from '../models/subscriptionModel.js';
import { Employee } from '../models/employeeModel.js';
import { Menu } from '../models/menuModel.js';
import { getCutoffTime } from '../utils/cutoffTime.js';
import {
  getDefaultMenuChoice,
  isValidMenuChoice,
} from '../utils/menuUtils.js';

export const lunchController = {
  async confirmLunch(req, res) {
    try {
      const { date, status, notes, menu_choice } = req.body;
      const employeeId = req.user.id;

      if (!date || !status) {
        return res.status(400).json({ message: 'Date and status are required' });
      }

      const cutoffTime = getCutoffTime();
      const [cutoffHour, cutoffMinute] = cutoffTime.split(':').map(Number);

      const now = new Date();
      const confirmationDate = new Date(date);
      const isSameDay = now.toDateString() === confirmationDate.toDateString();

      const isLate = false;
      if (isSameDay) {
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        if (currentHour > cutoffHour || (currentHour === cutoffHour && currentMinute >= cutoffMinute)) {
          return res.status(403).json({
            message: `Cutoff time (${cutoffTime}) has passed. Cannot confirm lunch.`,
          });
        }
      }

      const currentDate = new Date(date);
      const subscription = await Subscription.findByEmployeeAndMonth(
        employeeId,
        currentDate.getMonth() + 1,
        currentDate.getFullYear()
      );
      const employee = await Employee.findById(employeeId);
      const monthlyFoodChoice =
        subscription?.monthly_food_choice || employee.food_preference || 'regular';

      let selectedMenuChoice = menu_choice || null;

      if (status === 'confirmed') {
        const menu = await Menu.findByDate(date);
        if (!menu) {
          return res.status(400).json({ message: 'No menu has been set for this date' });
        }

        selectedMenuChoice = menu_choice || getDefaultMenuChoice(menu, monthlyFoodChoice);

        if (!isValidMenuChoice(menu, selectedMenuChoice, monthlyFoodChoice)) {
          return res.status(400).json({ message: 'Invalid menu choice for your food preference' });
        }
      }

      const confirmation = await LunchConfirmation.create({
        employee_id: employeeId,
        date,
        status,
        is_late: isLate,
        notes,
      });

      res.json({
        success: true,
        message: `Lunch ${status} successfully`,
        confirmation,
      });
    } catch (error) {
      console.error('Confirm lunch error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getTodayConfirmation(req, res) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const confirmation = await LunchConfirmation.findByEmployeeAndDate(req.user.id, today);

      res.json({
        success: true,
        confirmation: confirmation || { status: 'pending', date: today },
      });
    } catch (error) {
      console.error('Get today confirmation error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getHistory(req, res) {
    try {
      const { month, year } = req.query;
      const employeeId = req.user.id;

      const currentDate = new Date();
      const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
      const targetYear = year ? parseInt(year) : currentDate.getFullYear();

      const history = await LunchConfirmation.getMonthlyHistory(employeeId, targetMonth, targetYear);

      res.json({
        success: true,
        month: targetMonth,
        year: targetYear,
        history,
      });
    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getAllTodayConfirmations(req, res) {
    try {
      const date = req.query.date || new Date().toISOString().split('T')[0];
      const confirmations = await LunchConfirmation.getTodayConfirmations(date);

      res.json({
        success: true,
        date,
        confirmations,
      });
    } catch (error) {
      console.error('Get all today confirmations error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getPendingConfirmations(req, res) {
    try {
      const date = req.query.date || new Date().toISOString().split('T')[0];
      const pending = await LunchConfirmation.getPendingConfirmations(date);

      res.json({
        success: true,
        date,
        pending,
      });
    } catch (error) {
      console.error('Get pending confirmations error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getStats(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const start = startDate || new Date().toISOString().split('T')[0];
      const end = endDate || start;

      const stats = await LunchConfirmation.getStatsByDateRange(start, end);
      const foodStats = await LunchConfirmation.getFoodPreferenceStats(start);

      res.json({
        success: true,
        stats,
        foodPreferenceBreakdown: foodStats,
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getDailySheet(req, res) {
    try {
      const date = req.query.date || new Date().toISOString().split('T')[0];
      const sheetDate = new Date(date);
      const month = sheetDate.getMonth() + 1;
      const year = sheetDate.getFullYear();

      const employees = await LunchConfirmation.getSheetForDate(date, month, year);

      const sheet = employees.map((row) => ({
        employee_id: row.employee_id,
        emp_id: row.emp_id,
        name: row.name,
        email: row.email,
        subscription_type: row.subscription_type,
        enjoyed: row.status === 'confirmed',
        status: row.status || 'pending',
        notes: row.notes,
        sheet_updated_at: row.sheet_updated_at,
      }));

      res.json({
        success: true,
        date,
        sheet,
        summary: {
          total: sheet.length,
          enjoyed: sheet.filter((e) => e.enjoyed).length,
          not_enjoyed: sheet.filter((e) => e.status === 'skipped').length,
          pending: sheet.filter((e) => !e.enjoyed && e.status !== 'skipped').length,
        },
      });
    } catch (error) {
      console.error('Get daily sheet error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async saveDailySheet(req, res) {
    try {
      const { date, entries } = req.body;

      if (!date || !Array.isArray(entries) || entries.length === 0) {
        return res.status(400).json({ message: 'Date and entries are required' });
      }

      const confirmations = entries.map((entry) => ({
        employee_id: entry.employee_id,
        date,
        status: entry.enjoyed ? 'confirmed' : 'skipped',
        notes: entry.enjoyed
          ? 'Signed on daily food sheet — enjoyed meal'
          : 'Not signed on daily food sheet',
      }));

      await LunchConfirmation.bulkUpsert(confirmations);

      res.json({
        success: true,
        message: 'Daily sheet saved successfully',
        saved: confirmations.length,
      });
    } catch (error) {
      console.error('Save daily sheet error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
};
