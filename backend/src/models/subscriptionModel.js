import pool from '../config/database.js';

export const Subscription = {
  async findByEmployeeAndMonth(employeeId, month, year) {
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE employee_id = $1 AND month = $2 AND year = $3',
      [employeeId, month, year]
    );
    return result.rows[0];
  },

  async findActiveByEmployee(employeeId) {
    const currentDate = new Date();
    const result = await pool.query(
      `SELECT * FROM subscriptions 
       WHERE employee_id = $1 AND month = $2 AND year = $3 AND is_active = TRUE`,
      [employeeId, currentDate.getMonth() + 1, currentDate.getFullYear()]
    );
    return result.rows[0];
  },

  async create(subscriptionData) {
    const {
      employee_id,
      subscription_type,
      month,
      year,
      start_date,
      end_date,
      monthly_food_choice,
    } = subscriptionData;
    const result = await pool.query(
      `INSERT INTO subscriptions (
        employee_id, subscription_type, month, year, start_date, end_date, monthly_food_choice, is_active
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
       ON CONFLICT (employee_id, month, year)
       DO UPDATE SET
         subscription_type = $2,
         start_date = $5,
         end_date = $6,
         monthly_food_choice = $7,
         is_active = TRUE
       RETURNING *`,
      [
        employee_id,
        subscription_type,
        month,
        year,
        start_date,
        end_date,
        monthly_food_choice || 'regular',
      ]
    );
    return result.rows[0];
  },

  async getAll() {
    const result = await pool.query(
      `SELECT s.*, e.name, e.email, e.employee_id as emp_id 
       FROM subscriptions s 
       JOIN employees e ON s.employee_id = e.id 
       ORDER BY s.year DESC, s.month DESC, e.name`
    );
    return result.rows;
  },

  async getActiveSubscriptions(month, year) {
    const result = await pool.query(
      `SELECT s.*, e.name, e.email, e.employee_id as emp_id 
       FROM subscriptions s 
       JOIN employees e ON s.employee_id = e.id 
       WHERE s.month = $1 AND s.year = $2 AND s.is_active = TRUE
       ORDER BY e.name`,
      [month, year]
    );
    return result.rows;
  },

  async deactivate(id) {
    await pool.query('UPDATE subscriptions SET is_active = FALSE WHERE id = $1', [id]);
  }
};
