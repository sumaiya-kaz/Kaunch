import pool from '../config/database.js';

async function verifyDatabase() {
  try {
    console.log('🔍 Verifying database content...\n');

    // Check employees
    const employees = await pool.query(`
      SELECT employee_id, name, role, food_preference, fine_balance, is_active
      FROM employees
      ORDER BY role DESC, name
      LIMIT 10
    `);
    
    console.log('👥 Sample Employees:');
    console.table(employees.rows);

    // Check subscriptions
    const subscriptions = await pool.query(`
      SELECT e.name, e.employee_id, s.subscription_type, s.month, s.year, s.is_active
      FROM subscriptions s
      JOIN employees e ON e.id = s.employee_id
      WHERE s.is_active = true
      ORDER BY e.name
      LIMIT 10
    `);
    
    console.log('\n📅 Active Subscriptions (Sample):');
    console.table(subscriptions.rows);

    // Check recent menu items
    const menus = await pool.query(`
      SELECT date, food_type, description
      FROM menu_items
      WHERE date >= CURRENT_DATE
      ORDER BY date
      LIMIT 7
    `);
    
    console.log('\n🍽️  Upcoming Menu Items:');
    console.table(menus.rows);

    // Check fines
    const fines = await pool.query(`
      SELECT e.name, e.employee_id, f.date, f.amount, f.reason, f.status
      FROM fines f
      JOIN employees e ON e.id = f.employee_id
      ORDER BY f.date DESC
      LIMIT 10
    `);
    
    console.log('\n💰 Recent Fines:');
    console.table(fines.rows);

    // Check statistics
    const stats = await pool.query(`
      SELECT 
        COUNT(DISTINCT CASE WHEN lc.status = 'confirmed' THEN lc.employee_id END) as employees_with_confirmations,
        COUNT(CASE WHEN lc.status = 'confirmed' THEN 1 END) as total_confirmations,
        COUNT(CASE WHEN lc.status = 'skipped' THEN 1 END) as total_skipped,
        COUNT(CASE WHEN lc.status = 'pending' THEN 1 END) as total_missed,
        COUNT(CASE WHEN lc.is_late = true THEN 1 END) as late_confirmations
      FROM lunch_confirmations lc
    `);
    
    console.log('\n📊 Lunch Confirmation Statistics:');
    console.table(stats.rows);

    console.log('\n✅ Database verification complete!');
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await pool.end();
  }
}

verifyDatabase();
