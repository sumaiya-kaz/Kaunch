import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import {
  EMPLOYEES,
  SUBSCRIPTION_DATES,
  SUBSCRIPTION_MONTH,
  SUBSCRIPTION_YEAR,
  getFoodPreference,
  getSubscriptionType,
  nameToEmail,
  nameToEmployeeId,
} from './subscriptionSheetData.js';
import { buildWeeklyMenus } from '../utils/menuUtils.js';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const FINE_AMOUNT = parseFloat(process.env.DEFAULT_FINE_AMOUNT || 50);

const PREVIOUS_MONTH = SUBSCRIPTION_MONTH === 1 ? 12 : SUBSCRIPTION_MONTH - 1;
const PREVIOUS_YEAR = SUBSCRIPTION_MONTH === 1 ? SUBSCRIPTION_YEAR - 1 : SUBSCRIPTION_YEAR;

const FINES_TO_SEED = [
  // Previous month (May 2026)
  { name: 'Forhad', date: '2026-05-08', status: 'paid', reason: 'Missed lunch confirmation (subscribed but did not confirm)' },
  { name: 'Belal', date: '2026-05-14', status: 'pending', reason: 'No lunch confirmation submitted' },
  { name: 'Nahian', date: '2026-05-19', status: 'pending', reason: 'No lunch confirmation submitted' },
  { name: 'Rijvy', date: '2026-05-22', status: 'paid', reason: 'Late confirmation after cutoff' },
  { name: 'Mehedi', date: '2026-05-27', status: 'paid', reason: 'Missed lunch confirmation (subscribed but did not confirm)', notes: 'Resolved by admin' },
  { name: 'Sakil', date: '2026-05-30', status: 'pending', reason: 'No lunch confirmation submitted' },
  { name: 'Uttam', date: '2026-05-07', status: 'paid', reason: 'Late confirmation after cutoff' },
  { name: 'Roshid', date: '2026-05-16', status: 'pending', reason: 'No lunch confirmation submitted' },
  // Current month (June 2026)
  { name: 'Forhad', date: '2026-06-23', status: 'pending', reason: 'No lunch confirmation submitted' },
  { name: 'Sumaiya', date: '2026-06-24', status: 'pending', reason: 'Missed lunch confirmation (subscribed but did not confirm)' },
  { name: 'Abdur Rouf', date: '2026-06-22', status: 'pending', reason: 'No lunch confirmation submitted' },
  { name: 'Anower Ullah', date: '2026-06-22', status: 'pending', reason: 'No lunch confirmation submitted' },
  { name: 'Biplob', date: '2026-06-26', status: 'paid', reason: 'Late confirmation after cutoff' },
  { name: 'Saima', date: '2026-06-24', status: 'pending', reason: 'No lunch confirmation submitted' },
  { name: 'Shuvo', date: '2026-06-25', status: 'paid', reason: 'Missed lunch confirmation (subscribed but did not confirm)', notes: 'Resolved by admin' },
  { name: 'Rana', date: '2026-06-30', status: 'pending', reason: 'No lunch confirmation submitted' },
  { name: 'Nasim', date: '2026-06-25', status: 'paid', reason: 'Late confirmation after cutoff' },
  { name: 'Tanzeel', date: '2026-05-21', status: 'pending', reason: 'No lunch confirmation submitted' },
];

function getEmployeeIdByName(sheetEmployees, name) {
  const index = EMPLOYEES.findIndex((employee) => employee.name === name);
  if (index === -1) {
    throw new Error(`Employee not found for fine seed: ${name}`);
  }
  return sheetEmployees[index].id;
}

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database from Lunch Subscription Sheet (June 2026)...\n');

    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    console.log('🗑️  Clearing existing data...');
    await pool.query(
      'TRUNCATE TABLE fines, lunch_confirmations, subscriptions, menu_items, employees RESTART IDENTITY CASCADE'
    );

    console.log('👥 Inserting employees from subscription sheet...');
    const employeeRows = [];

    const adminResult = await pool.query(
      `INSERT INTO employees (employee_id, name, email, password, role, food_preference, is_active, fine_balance)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, employee_id, name`,
      ['ADMIN001', 'System Admin', 'admin@kaunch.com', adminPassword, 'admin', 'regular', true, 0]
    );
    employeeRows.push(adminResult.rows[0]);

    for (let i = 0; i < EMPLOYEES.length; i++) {
      const { name } = EMPLOYEES[i];
      const result = await pool.query(
        `INSERT INTO employees (employee_id, name, email, password, role, food_preference, is_active, fine_balance)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, employee_id, name`,
        [
          nameToEmployeeId(i),
          name,
          nameToEmail(name),
          hashedPassword,
          'employee',
          getFoodPreference(name),
          true,
          0,
        ]
      );
      employeeRows.push(result.rows[0]);
    }

    console.log(`   ✅ Inserted ${employeeRows.length} employees (1 admin + ${EMPLOYEES.length} from sheet)`);

    const sheetEmployees = employeeRows.slice(1);

    console.log('📅 Inserting June 2026 subscriptions...');
    let subscriptionCount = 0;

    for (let i = 0; i < EMPLOYEES.length; i++) {
      const { days } = EMPLOYEES[i];
      const subscriptionType = getSubscriptionType(days);
      if (subscriptionType === 'none') continue;

      await pool.query(
        `INSERT INTO subscriptions (
          employee_id, subscription_type, month, year, start_date, end_date, monthly_food_choice, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)`,
        [
          sheetEmployees[i].id,
          subscriptionType,
          SUBSCRIPTION_MONTH,
          SUBSCRIPTION_YEAR,
          SUBSCRIPTION_DATES[0],
          SUBSCRIPTION_DATES[SUBSCRIPTION_DATES.length - 1],
          getFoodPreference(EMPLOYEES[i].name),
        ]
      );
      subscriptionCount++;
    }

    console.log(`   ✅ Inserted ${subscriptionCount} subscriptions`);

    console.log(`📅 Inserting ${PREVIOUS_MONTH}/${PREVIOUS_YEAR} subscriptions...`);
    let previousSubscriptionCount = 0;

    for (let i = 0; i < EMPLOYEES.length; i++) {
      const subscriptionType = getSubscriptionType(EMPLOYEES[i].days);
      if (subscriptionType === 'none') continue;

      await pool.query(
        `INSERT INTO subscriptions (
          employee_id, subscription_type, month, year, start_date, end_date, monthly_food_choice, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE)`,
        [
          sheetEmployees[i].id,
          subscriptionType,
          PREVIOUS_MONTH,
          PREVIOUS_YEAR,
          `${PREVIOUS_YEAR}-${String(PREVIOUS_MONTH).padStart(2, '0')}-01`,
          `${PREVIOUS_YEAR}-${String(PREVIOUS_MONTH).padStart(2, '0')}-31`,
          getFoodPreference(EMPLOYEES[i].name),
        ]
      );
      previousSubscriptionCount++;
    }

    console.log(`   ✅ Inserted ${previousSubscriptionCount} previous-month subscriptions`);

    console.log('🍽️  Inserting weekly menus for June 2026...');
    const menuWeeks = [
      {
        weekStartDate: '2026-06-22',
        startProtein: 'chicken',
        fridayOption: 'roast_polaw',
        fridayMeat: 'beef',
      },
      {
        weekStartDate: '2026-06-29',
        startProtein: 'fish',
        fridayOption: 'khichuri',
        fridayMeat: 'mutton',
      },
    ];

    const menuByDate = {};
    let menuCount = 0;

    for (const week of menuWeeks) {
      const weeklyMenus = buildWeeklyMenus(week);
      for (const menu of weeklyMenus) {
        await pool.query(
          `INSERT INTO menu_items (
            date, menu_type, main_protein, side_dish, friday_option, friday_meat, description, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (date) DO NOTHING`,
          [
            menu.date,
            menu.menu_type,
            menu.main_protein,
            menu.side_dish,
            menu.friday_option,
            menu.friday_meat,
            menu.description,
            employeeRows[0].id,
          ]
        );
        menuByDate[menu.date] = menu;
        menuCount += 1;
      }
    }

    console.log(`   ✅ Inserted ${menuCount} menu days`);

    console.log('✅ Inserting lunch confirmations from sheet (Yes/No per day)...');
    const confirmations = [];

    for (let i = 0; i < EMPLOYEES.length; i++) {
      const { days } = EMPLOYEES[i];
      const employeeId = sheetEmployees[i].id;

      days.forEach((subscribed, dayIndex) => {
        const date = SUBSCRIPTION_DATES[dayIndex];
        const status = subscribed ? 'confirmed' : 'skipped';
        confirmations.push({ employeeId, date, status });
      });
    }

    for (const c of confirmations) {
      await pool.query(
        `INSERT INTO lunch_confirmations (employee_id, date, status, is_late)
         VALUES ($1, $2, $3, FALSE)`,
        [c.employeeId, c.date, c.status]
      );
    }

    console.log(`   ✅ Inserted ${confirmations.length} lunch confirmations`);

    console.log('💰 Inserting fines for current and previous month...');
    const adminId = employeeRows[0].id;
    let fineCount = 0;

    for (const fine of FINES_TO_SEED) {
      const employeeId = getEmployeeIdByName(sheetEmployees, fine.name);
      const resolvedBy = fine.status === 'paid' ? adminId : null;
      const resolvedAt = resolvedBy ? `${fine.date} 18:00:00` : null;

      await pool.query(
        `INSERT INTO fines (employee_id, date, amount, reason, status, applied_by, resolved_by, resolved_at, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          employeeId,
          fine.date,
          FINE_AMOUNT,
          fine.reason,
          fine.status,
          adminId,
          resolvedBy,
          resolvedAt,
          fine.notes || null,
        ]
      );
      fineCount++;
    }

    await pool.query(`
      UPDATE employees e
      SET fine_balance = COALESCE((
        SELECT SUM(amount)
        FROM fines f
        WHERE f.employee_id = e.id AND f.status = 'pending'
      ), 0.00)
    `);

    console.log(`   ✅ Inserted ${fineCount} fines and updated fine balances`);

    console.log('\n✨ Database seeding completed successfully!\n');

    const summary = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM employees) AS total_employees,
        (SELECT COUNT(*) FROM employees WHERE role = 'employee') AS sheet_employees,
        (SELECT COUNT(*) FROM subscriptions) AS total_subscriptions,
        (SELECT COUNT(*) FROM lunch_confirmations) AS total_confirmations,
        (SELECT COUNT(*) FROM lunch_confirmations WHERE status = 'confirmed') AS confirmed_lunches,
        (SELECT COUNT(*) FROM lunch_confirmations WHERE status = 'skipped') AS skipped_lunches,
        (SELECT COUNT(*) FROM fines) AS total_fines,
        (SELECT COUNT(*) FROM fines WHERE EXTRACT(MONTH FROM date) = $1 AND EXTRACT(YEAR FROM date) = $2) AS current_month_fines,
        (SELECT COUNT(*) FROM fines WHERE EXTRACT(MONTH FROM date) = $3 AND EXTRACT(YEAR FROM date) = $4) AS previous_month_fines,
        (SELECT COUNT(*) FROM fines WHERE status = 'pending') AS pending_fines,
        (SELECT SUM(fine_balance) FROM employees) AS total_pending_balance
    `, [SUBSCRIPTION_MONTH, SUBSCRIPTION_YEAR, PREVIOUS_MONTH, PREVIOUS_YEAR]);

    const s = summary.rows[0];
    console.log('📊 Summary (June 2026 subscription sheet):');
    console.log(`   - Total Employees: ${s.total_employees} (${s.sheet_employees} from sheet + 1 admin)`);
    console.log(`   - Subscriptions: ${s.total_subscriptions}`);
    console.log(`   - Lunch Confirmations: ${s.total_confirmations}`);
    console.log(`   - Confirmed (Yes): ${s.confirmed_lunches}`);
    console.log(`   - Skipped (No): ${s.skipped_lunches}`);
    console.log(`   - Fines: ${s.total_fines} (${s.current_month_fines} in ${SUBSCRIPTION_MONTH}/${SUBSCRIPTION_YEAR}, ${s.previous_month_fines} in ${PREVIOUS_MONTH}/${PREVIOUS_YEAR})`);
    console.log(`   - Pending fines: ${s.pending_fines} (BDT ${s.total_pending_balance})\n`);

    console.log('🔐 Login credentials:');
    console.log('   Admin: admin@kaunch.com / admin123');
    console.log('   Employees: <name>@company.com / password123');
    console.log('   Example: sumaiya@company.com / password123\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seedDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
