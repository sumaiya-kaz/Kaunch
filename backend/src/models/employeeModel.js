import pool from '../config/database.js';

export const Employee = {
  async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM employees WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      'SELECT id, employee_id, name, email, role, food_preference, is_active, fine_balance, created_at FROM employees WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query(
      'SELECT id, employee_id, name, email, role, food_preference, is_active, fine_balance, created_at FROM employees ORDER BY name'
    );
    return result.rows;
  },

  async create(employeeData) {
    const { employee_id, name, email, password, role, food_preference } = employeeData;
    const result = await pool.query(
      `INSERT INTO employees (employee_id, name, email, password, role, food_preference)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, employee_id, name, email, role, food_preference, is_active, fine_balance`,
      [employee_id, name, email, password, role || 'employee', food_preference || 'regular']
    );
    return result.rows[0];
  },

  async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      fields.push(`${key} = $${paramCount}`);
      values.push(updateData[key]);
      paramCount++;
    });

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE employees SET ${fields.join(', ')} WHERE id = $${paramCount}
       RETURNING id, employee_id, name, email, role, food_preference, is_active, fine_balance`,
      values
    );
    return result.rows[0];
  },

  async updateFineBalance(employeeId, amount) {
    const result = await pool.query(
      'UPDATE employees SET fine_balance = fine_balance + $1 WHERE id = $2 RETURNING fine_balance',
      [amount, employeeId]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM employees WHERE id = $1', [id]);
  }
};
