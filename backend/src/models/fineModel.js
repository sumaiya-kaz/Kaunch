import pool from '../config/database.js';

export const Fine = {
  async create(fineData) {
    const { employee_id, date, amount, reason, applied_by } = fineData;
    const result = await pool.query(
      `INSERT INTO fines (employee_id, date, amount, reason, applied_by, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [employee_id, date, amount, reason, applied_by]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT f.*, e.name as employee_name, e.employee_id as emp_id, e.email
       FROM fines f
       JOIN employees e ON f.employee_id = e.id
       WHERE f.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async getByEmployee(employeeId) {
    const result = await pool.query(
      `SELECT * FROM fines WHERE employee_id = $1 ORDER BY date DESC`,
      [employeeId]
    );
    return result.rows;
  },

  async getAll() {
    const result = await pool.query(
      `SELECT f.*, e.name as employee_name, e.employee_id as emp_id, e.email
       FROM fines f
       JOIN employees e ON f.employee_id = e.id
       ORDER BY f.created_at DESC`
    );
    return result.rows;
  },

  async getByMonth(month, year) {
    const result = await pool.query(
      `SELECT f.*, e.name as employee_name, e.employee_id as emp_id, e.email
       FROM fines f
       JOIN employees e ON f.employee_id = e.id
       WHERE EXTRACT(MONTH FROM f.date) = $1 AND EXTRACT(YEAR FROM f.date) = $2
       ORDER BY f.date DESC`,
      [month, year]
    );
    return result.rows;
  },

  async updateStatus(id, status, resolvedBy, notes) {
    const result = await pool.query(
      `UPDATE fines 
       SET status = $1, resolved_by = $2, resolved_at = CURRENT_TIMESTAMP, notes = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [status, resolvedBy, notes, id]
    );
    return result.rows[0];
  },

  async getTotalByEmployee(employeeId) {
    const result = await pool.query(
      `SELECT SUM(amount) as total FROM fines WHERE employee_id = $1 AND status = 'pending'`,
      [employeeId]
    );
    return result.rows[0]?.total || 0;
  },

  async getMonthlyStats(month, year) {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_fines,
        SUM(amount) as total_amount,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'paid') as paid_count
       FROM fines
       WHERE EXTRACT(MONTH FROM date) = $1 AND EXTRACT(YEAR FROM date) = $2`,
      [month, year]
    );
    return result.rows[0];
  },

  async findByEmployeeAndDate(employeeId, date) {
    const result = await pool.query(
      'SELECT * FROM fines WHERE employee_id = $1 AND date = $2',
      [employeeId, date]
    );
    return result.rows[0];
  },

  async getByDate(date) {
    const result = await pool.query(
      `SELECT f.*, e.name as employee_name, e.employee_id as emp_id, e.email
       FROM fines f
       JOIN employees e ON f.employee_id = e.id
       WHERE f.date = $1
       ORDER BY e.name`,
      [date]
    );
    return result.rows;
  },

  async deletePendingByEmployeeAndDate(employeeId, date) {
    const result = await pool.query(
      `DELETE FROM fines
       WHERE employee_id = $1 AND date = $2 AND status = 'pending'
       RETURNING *`,
      [employeeId, date]
    );
    return result.rows[0];
  },
};
