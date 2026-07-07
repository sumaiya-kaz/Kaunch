import pool from '../config/database.js';
import { buildMenuDescription } from '../utils/menuUtils.js';

const formatPgDate = (value) => {
  if (!value) return value;
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toLocaleDateString('en-CA');
};

const mapMenuRow = (row) => {
  if (!row) return row;
  return {
    ...row,
    date: formatPgDate(row.date),
    food_cost: row.food_cost != null ? Number(row.food_cost) : null,
  };
};

const MENU_FIELDS = [
  'date',
  'menu_type',
  'main_protein',
  'side_dish',
  'friday_option',
  'friday_meat',
  'description',
  'protein_dish',
  'side_item',
  'dal_item',
  'extra_items',
  'food_cost',
  'created_by',
];

export const Menu = {
  async create(menuData) {
    const {
      date,
      menu_type,
      main_protein,
      side_dish,
      friday_option,
      friday_meat,
      description,
      protein_dish,
      side_item,
      dal_item,
      extra_items,
      food_cost,
      created_by,
    } = menuData;

    const finalDescription =
      description ||
      buildMenuDescription({
        menu_type,
        main_protein,
        side_dish,
        friday_option,
        friday_meat,
        protein_dish,
        side_item,
        dal_item,
        extra_items,
      });

    const result = await pool.query(
      `INSERT INTO menu_items (
        date, menu_type, main_protein, side_dish, friday_option, friday_meat,
        description, protein_dish, side_item, dal_item, extra_items, food_cost, created_by
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (date)
       DO UPDATE SET
         menu_type = EXCLUDED.menu_type,
         main_protein = EXCLUDED.main_protein,
         side_dish = EXCLUDED.side_dish,
         friday_option = EXCLUDED.friday_option,
         friday_meat = EXCLUDED.friday_meat,
         description = EXCLUDED.description,
         protein_dish = EXCLUDED.protein_dish,
         side_item = EXCLUDED.side_item,
         dal_item = EXCLUDED.dal_item,
         extra_items = EXCLUDED.extra_items,
         food_cost = EXCLUDED.food_cost,
         created_by = EXCLUDED.created_by
       RETURNING *`,
      [
        date,
        menu_type,
        main_protein || null,
        side_dish || null,
        friday_option || null,
        friday_meat || null,
        finalDescription,
        protein_dish || null,
        side_item || null,
        dal_item || null,
        extra_items || null,
        food_cost ?? null,
        created_by,
      ]
    );
    return mapMenuRow(result.rows[0]);
  },

  async findByDate(date) {
    const result = await pool.query('SELECT * FROM menu_items WHERE date = $1', [date]);
    return mapMenuRow(result.rows[0]);
  },

  async getByDateRange(startDate, endDate) {
    const result = await pool.query(
      `SELECT m.*, e.name as created_by_name
       FROM menu_items m
       LEFT JOIN employees e ON m.created_by = e.id
       WHERE m.date BETWEEN $1 AND $2
       ORDER BY m.date`,
      [startDate, endDate]
    );
    return result.rows.map(mapMenuRow);
  },

  async update(id, updateData) {
    const allowed = {};
    for (const key of MENU_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(updateData, key)) {
        allowed[key] = updateData[key];
      }
    }

    if (
      allowed.menu_type ||
      allowed.main_protein ||
      allowed.side_dish ||
      allowed.protein_dish ||
      allowed.side_item ||
      allowed.dal_item ||
      allowed.extra_items
    ) {
      const existing = await pool.query('SELECT * FROM menu_items WHERE id = $1', [id]);
      const current = existing.rows[0];
      if (current) {
        allowed.description = buildMenuDescription({ ...current, ...allowed });
      }
    }

    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(allowed).forEach(([key, value]) => {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount += 1;
    });

    if (fields.length === 0) return null;

    values.push(id);

    const result = await pool.query(
      `UPDATE menu_items SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return mapMenuRow(result.rows[0]);
  },

  async delete(id) {
    await pool.query('DELETE FROM menu_items WHERE id = $1', [id]);
  },
};
