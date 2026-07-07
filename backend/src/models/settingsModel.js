import pool from '../config/database.js';

export const Settings = {
  async get(key) {
    const result = await pool.query('SELECT value FROM app_settings WHERE key = $1', [key]);
    return result.rows[0]?.value ?? null;
  },

  async set(key, value, updatedBy = null) {
    const result = await pool.query(
      `INSERT INTO app_settings (key, value, updated_by, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (key)
       DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [key, value, updatedBy]
    );
    return result.rows[0];
  },
};
