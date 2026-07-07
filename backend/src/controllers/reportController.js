import pool from '../config/database.js';
import { Menu } from '../models/menuModel.js';
import { buildFoodPreferenceBreakdown } from '../utils/menuUtils.js';
import { normalizeFoodChoice } from '../utils/foodChoice.js';

export const reportController = {
  async getEmployeeReport(req, res) {
    try {
      const { employeeId, startDate, endDate } = req.query;

      const query = `
        SELECT 
          e.employee_id, e.name, e.email, e.food_preference,
          lc.date, lc.status, lc.is_late,
          f.amount as fine_amount, f.status as fine_status
        FROM employees e
        LEFT JOIN lunch_confirmations lc ON e.id = lc.employee_id
        LEFT JOIN fines f ON e.id = f.employee_id AND f.date = lc.date
        WHERE e.id = $1 AND lc.date BETWEEN $2 AND $3
        ORDER BY lc.date DESC
      `;

      const result = await pool.query(query, [employeeId, startDate, endDate]);

      res.json({
        success: true,
        report: result.rows
      });
    } catch (error) {
      console.error('Get employee report error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getDailyReport(req, res) {
    try {
      const { date } = req.query;
      const targetDate = date || new Date().toISOString().split('T')[0];

      const query = `
        SELECT 
          e.employee_id, e.name, e.food_preference,
          lc.status,
          s.subscription_type
        FROM employees e
        LEFT JOIN lunch_confirmations lc ON e.id = lc.employee_id AND lc.date = $1
        LEFT JOIN subscriptions s ON e.id = s.employee_id 
          AND s.month = EXTRACT(MONTH FROM $1::DATE)
          AND s.year = EXTRACT(YEAR FROM $1::DATE)
          AND s.is_active = TRUE
        WHERE e.is_active = TRUE
        ORDER BY e.name
      `;

      const result = await pool.query(query, [targetDate]);

      // Get summary stats
      const statsQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_count,
          COUNT(*) FILTER (WHERE status = 'skipped') as skipped_count
        FROM lunch_confirmations
        WHERE date = $1
      `;

      const statsResult = await pool.query(statsQuery, [targetDate]);

      res.json({
        success: true,
        date: targetDate,
        report: result.rows,
        stats: statsResult.rows[0]
      });
    } catch (error) {
      console.error('Get daily report error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getMonthlyReport(req, res) {
    try {
      const { month, year } = req.query;
      const currentDate = new Date();
      
      const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
      const targetYear = year ? parseInt(year) : currentDate.getFullYear();

      const query = `
        SELECT 
          e.employee_id, e.name,
          COUNT(lc.id) FILTER (WHERE lc.status = 'confirmed') as confirmed_count,
          COUNT(lc.id) FILTER (WHERE lc.status = 'skipped') as skipped_count,
          s.subscription_type
        FROM employees e
        LEFT JOIN lunch_confirmations lc ON e.id = lc.employee_id
          AND EXTRACT(MONTH FROM lc.date) = $1
          AND EXTRACT(YEAR FROM lc.date) = $2
        LEFT JOIN subscriptions s ON e.id = s.employee_id
          AND s.month = $1 AND s.year = $2
        WHERE e.is_active = TRUE
        GROUP BY e.id, e.employee_id, e.name, s.subscription_type
        ORDER BY e.name
      `;

      const result = await pool.query(query, [targetMonth, targetYear]);

      res.json({
        success: true,
        month: targetMonth,
        year: targetYear,
        report: result.rows
      });
    } catch (error) {
      console.error('Get monthly report error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getDashboardStats(req, res) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Today's stats
      const todayStats = await pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'confirmed') as today_confirmed,
          COUNT(*) FILTER (WHERE status = 'skipped') as today_skipped,
          COUNT(*) FILTER (WHERE status = 'pending') as today_pending
        FROM lunch_confirmations
        WHERE date = $1
      `, [today]);

      // Monthly stats
      const monthlyStats = await pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE lc.status = 'confirmed') as month_confirmed,
          COUNT(*) FILTER (WHERE lc.status = 'skipped') as month_skipped,
          COALESCE(SUM(f.amount), 0) as month_fines
        FROM lunch_confirmations lc
        LEFT JOIN fines f ON lc.employee_id = f.employee_id AND lc.date = f.date
        WHERE EXTRACT(MONTH FROM lc.date) = $1 AND EXTRACT(YEAR FROM lc.date) = $2
      `, [currentMonth, currentYear]);

      const menu = await Menu.findByDate(today);

      const foodChoicesResult = await pool.query(`
        SELECT e.food_preference AS food_choice
        FROM lunch_confirmations lc
        JOIN employees e ON lc.employee_id = e.id
        WHERE lc.date = $1 AND lc.status = 'confirmed'
      `, [today]);

      const foodBreakdown = buildFoodPreferenceBreakdown(
        menu,
        foodChoicesResult.rows.map((row) => normalizeFoodChoice(row.food_choice))
      );

      res.json({
        success: true,
        today: todayStats.rows[0],
        monthly: monthlyStats.rows[0],
        foodBreakdown,
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async exportReport(req, res) {
    try {
      const { type, startDate, endDate, month, year } = req.query;

      let query;
      let params;

      if (type === 'daily') {
        query = `
          SELECT 
            e.employee_id as "Employee ID",
            e.name as "Name",
            lc.date as "Date",
            lc.status as "Status",
            e.food_preference as "Food Preference",
            s.subscription_type as "Subscription Type"
          FROM employees e
          LEFT JOIN lunch_confirmations lc ON e.id = lc.employee_id AND lc.date = $1
          LEFT JOIN subscriptions s ON e.id = s.employee_id
          WHERE e.is_active = TRUE
          ORDER BY e.name
        `;
        params = [startDate];
      } else if (type === 'monthly') {
        query = `
          SELECT 
            e.employee_id as "Employee ID",
            e.name as "Name",
            lc.date as "Date",
            lc.status as "Status",
            e.food_preference as "Food Preference",
            s.subscription_type as "Subscription Type"
          FROM employees e
          LEFT JOIN lunch_confirmations lc ON e.id = lc.employee_id
          LEFT JOIN subscriptions s ON e.id = s.employee_id 
            AND s.month = $1 AND s.year = $2
          WHERE EXTRACT(MONTH FROM lc.date) = $1 
            AND EXTRACT(YEAR FROM lc.date) = $2
          ORDER BY lc.date DESC, e.name
        `;
        params = [month, year];
      }

      const result = await pool.query(query, params);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Export report error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};
