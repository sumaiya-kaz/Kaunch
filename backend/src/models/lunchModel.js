import pool from '../config/database.js';

export const LunchConfirmation = {
  async findByEmployeeAndDate(employeeId, date) {
    const result = await pool.query(
      'SELECT * FROM lunch_confirmations WHERE employee_id = $1 AND date = $2',
      [employeeId, date]
    );
    return result.rows[0];
  },

  async create(confirmationData) {
    const { employee_id, date, status, is_late, notes } = confirmationData;
    const result = await pool.query(
      `INSERT INTO lunch_confirmations (employee_id, date, status, is_late, notes)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (employee_id, date)
       DO UPDATE SET
         status = $3,
         is_late = $4,
         notes = $5,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [employee_id, date, status, is_late || false, notes]
    );
    return result.rows[0];
  },

  async getByDateRange(employeeId, startDate, endDate) {
    const result = await pool.query(
      `SELECT * FROM lunch_confirmations 
       WHERE employee_id = $1 AND date BETWEEN $2 AND $3
       ORDER BY date DESC`,
      [employeeId, startDate, endDate]
    );
    return result.rows;
  },

  async getTodayConfirmations(date) {
    const result = await pool.query(
      `SELECT lc.*, e.name, e.email, e.employee_id as emp_id, e.food_preference
       FROM lunch_confirmations lc
       JOIN employees e ON lc.employee_id = e.id
       WHERE lc.date = $1
       ORDER BY e.name`,
      [date]
    );
    return result.rows;
  },

  async getPendingConfirmations(date) {
    const result = await pool.query(
      `SELECT e.id, e.employee_id, e.name, e.email
       FROM employees e
       LEFT JOIN lunch_confirmations lc ON e.id = lc.employee_id AND lc.date = $1
       WHERE e.is_active = TRUE AND (lc.status IS NULL OR lc.status = 'pending')`,
      [date]
    );
    return result.rows;
  },

  async getMonthlyHistory(employeeId, month, year) {
    const result = await pool.query(
      `SELECT * FROM lunch_confirmations 
       WHERE employee_id = $1 AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3
       ORDER BY date`,
      [employeeId, month, year]
    );
    return result.rows;
  },

  async getStatsByDateRange(startDate, endDate) {
    const result = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_count,
        COUNT(*) FILTER (WHERE status = 'skipped') as skipped_count,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(DISTINCT employee_id) as total_employees
       FROM lunch_confirmations
       WHERE date BETWEEN $1 AND $2`,
      [startDate, endDate]
    );
    return result.rows[0];
  },

  async getFoodPreferenceStats(date) {
    const result = await pool.query(
      `SELECT e.food_preference, COUNT(*) as count
       FROM lunch_confirmations lc
       JOIN employees e ON lc.employee_id = e.id
       WHERE lc.date = $1 AND lc.status = 'confirmed'
       GROUP BY e.food_preference`,
      [date]
    );
    return result.rows;
  },

  async getSheetForDate(date, month, year) {
    const result = await pool.query(
      `SELECT
         e.id as employee_id,
         e.employee_id as emp_id,
         e.name,
         e.email,
         s.subscription_type,
         lc.status,
         lc.notes,
         lc.updated_at as sheet_updated_at
       FROM employees e
       JOIN subscriptions s ON s.employee_id = e.id
         AND s.month = $2 AND s.year = $3 AND s.is_active = TRUE
         AND s.subscription_type IN ('full', 'half')
       LEFT JOIN lunch_confirmations lc ON lc.employee_id = e.id AND lc.date = $1
       WHERE e.is_active = TRUE AND e.role = 'employee'
       ORDER BY e.name`,
      [date, month, year]
    );
    return result.rows;
  },

  async bulkUpsert(entries) {
    const results = [];
    for (const entry of entries) {
      const result = await pool.query(
        `INSERT INTO lunch_confirmations (employee_id, date, status, is_late, notes)
         VALUES ($1, $2, $3, FALSE, $4)
         ON CONFLICT (employee_id, date)
         DO UPDATE SET
           status = $3,
           notes = $4,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [entry.employee_id, entry.date, entry.status, entry.notes || null]
      );
      results.push(result.rows[0]);
    }
    return results;
  },
};
